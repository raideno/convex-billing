import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { CustomerStripeToConvex } from "@/schema/customer";
import { SubscriptionStripeToConvex } from "@/schema/subscription";
import { billingDispatchTyped } from "@/store";

// TODO: revisit
export const SubscriptionsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "subscriptions",
  handler: async (context, args, configuration) => {
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
      if (
        typeof subscription.customer !== "string" &&
        !subscription.customer.deleted &&
        !Object.keys(subscription.customer.metadata).includes("entityId")
      ) {
        configuration.logger.error(
          `Skipping subscription ${subscription.id} because it has no entityId metadata. This is due to the subscription being created outside of the checkout flow created by convex-billing.`
        );
        continue;
      }

      if (
        typeof subscription.customer !== "string" &&
        subscription.customer.deleted
      ) {
        await billingDispatchTyped(
          {
            operation: "deleteById",
            table: "convex_billing_customers",
            idField: "customerId",
            idValue: subscription.customer.id,
          },
          context,
          configuration
        );
      } else if (
        typeof subscription.customer !== "string" &&
        !subscription.customer.deleted
      ) {
        const customer = subscription.customer;
        const entityId = subscription.customer.metadata["entityId"];
        const customerId = subscription.customer.id;

        await billingDispatchTyped(
          {
            operation: "upsert",
            table: "convex_billing_customers",
            idField: "entityId",
            data: {
              entityId: entityId,
              customerId: customerId,
              stripe: CustomerStripeToConvex(customer),
              last_synced_at: Date.now(),
            },
          },
          context,
          configuration
        );

        await billingDispatchTyped(
          {
            operation: "upsert",
            table: "convex_billing_subscriptions",
            idField: "customerId",
            data: {
              customerId: customerId,
              subscriptionId: subscription.id,
              stripe: SubscriptionStripeToConvex(subscription),
              last_synced_at: Date.now(),
            },
          },
          context,
          configuration
        );
      } else {
        configuration.logger.error(
          `Skipping subscription ${subscription.id} because it has no entityId metadata. This is due to the subscription being created outside of the checkout flow created by convex-billing.`
        );
        continue;
      }
    }

    const localSubsResponse = await billingDispatchTyped(
      { operation: "selectAll", table: "convex_billing_subscriptions" },
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
        await billingDispatchTyped(
          {
            operation: "upsert",
            table: "convex_billing_subscriptions",
            idField: "customerId",
            data: {
              customerId: sub.customerId,
              subscriptionId: null,
              stripe: null,
              last_synced_at: Date.now(),
            },
          },
          context,
          configuration
        );
      }
    }
  },
});
