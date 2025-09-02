import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "../../helpers";
import { StoreImplementation } from "../../types";

export const syncSubscriptionImplementation = defineActionImplementation({
  args: {
    stripeCustomerId: v.string(),
  },
  name: "syncSubscription",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const stripeCustomerId = args.stripeCustomerId;

    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      limit: 1,
      status: "all",
      expand: ["data.default_payment_method"],
    });

    if (subscriptions.data.length === 0) {
      const subscription = subscriptions.data[0];
      await context.runMutation(configuration.store as StoreImplementation, {
        args: {
          name: "persistSubscriptionData",
          stripeCustomerId,
          data: {
            stripeCustomerId: stripeCustomerId,
            data: null,
            last_synced_at: Date.now(),
          },
        },
      });
      return null;
    }

    const subscription = subscriptions.data[0];

    await context.runMutation(configuration.store as StoreImplementation, {
      args: {
        name: "persistSubscriptionData",
        stripeCustomerId,
        data: {
          stripeCustomerId: stripeCustomerId,
          data: subscription,
          last_synced_at: Date.now(),
        },
      },
    });

    return subscription;
  },
});
