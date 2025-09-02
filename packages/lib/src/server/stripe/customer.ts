import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "../helpers";
import { StoreImplementation } from "../types";

export const createStripeCustomerImplementation = defineActionImplementation({
  name: "createStripeCustomer",
  args: {
    entityId: v.string(),
    email: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    let stripeCustomerId = await context.runMutation(
      configuration.store as StoreImplementation,
      {
        args: {
          name: "getStripeCustomerIdByEntityId",
          entityId: args.entityId,
        },
      }
    );

    if (stripeCustomerId) {
      return { stripeCustomerId };
    }

    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: args.email,
        metadata: {
          entityId: args.entityId,
          ...(args.metadata || {}),
        },
      });

      await context.runMutation(configuration.store as StoreImplementation, {
        args: {
          name: "persistStripeCustomerId",
          entityId: args.entityId,
          stripeCustomerId: stripeCustomer.id,
        },
      });

      stripeCustomerId = stripeCustomer.id;
    }

    return { stripeCustomerId };
  },
});
