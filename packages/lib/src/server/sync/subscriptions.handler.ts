import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { SubscriptionStripeToConvex } from "@/schema/subscription";
import { storeDispatchTyped } from "@/store";

export const SubscriptionsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "subscriptions",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripeSubscriptions !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const subscriptions = await stripe.subscriptions
      .list({
        limit: 100,
        expand: ["data.default_payment_method", "data.customer"],
      })
      .autoPagingToArray({ limit: 10_000 });

    for (const subscription of subscriptions) {
      const customer = subscription.customer;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;
      const entityId =
        typeof customer !== "string" && "metadata" in customer
          ? customer.metadata["entityId"]
          : null;

      if (!entityId) {
        configuration.logger.warn(
          `Subscription (${subscription.id}) don't have any entityId associated with it. This can be due to the subscription being created outside of convex-stripe's checkout flow.`
        );
      }

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripeSubscriptions",
          idField: "customerId",
          data: {
            customerId: customerId,
            subscriptionId: subscription.id,
            stripe: SubscriptionStripeToConvex(subscription),
            lastSyncedAt: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    const localSubsResponse = await storeDispatchTyped(
      { operation: "selectAll", table: "stripeSubscriptions" },
      context,
      configuration
    );
    const hasSub = new Set<string>(
      subscriptions.map((s) =>
        typeof s.customer === "string" ? s.customer : s.customer.id
      )
    );
    for (const sub of localSubsResponse.docs || []) {
      if (!hasSub.has(sub.customerId)) {
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripeSubscriptions",
            idField: "customerId",
            data: {
              customerId: sub.customerId,
              subscriptionId: null,
              stripe: null,
              lastSyncedAt: Date.now(),
            },
          },
          context,
          configuration
        );
      }
    }
  },
});
