import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { billingDispatchTyped } from "@/operations/helpers";

export const syncSubscriptionImplementation = defineActionImplementation({
  args: {
    customerId: v.string(),
  },
  name: "syncSubscription",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const customerId = args.customerId;

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: "all",
      expand: ["data.default_payment_method"],
    });

    if (subscriptions.data.length === 0) {
      await billingDispatchTyped(
        {
          op: "upsert",
          table: "convex_billing_subscriptions",
          idField: "customerId",
          data: {
            subscriptionId: null,
            customerId: customerId,
            stripe: null,
            last_synced_at: Date.now(),
          },
        },
        context,
        configuration
      );

      return null;
    }

    const subscription = subscriptions.data[0];

    await billingDispatchTyped(
      {
        op: "upsert",
        table: "convex_billing_subscriptions",
        idField: "customerId",
        data: {
          subscriptionId: subscription.id,
          customerId: customerId,
          stripe: subscription,
          last_synced_at: Date.now(),
        },
      },
      context,
      configuration
    );

    return subscription;
  },
});
