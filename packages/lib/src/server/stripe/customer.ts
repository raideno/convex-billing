import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "../helpers";
import { billingDispatchTyped } from "../operations/helpers";

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

    const stripeCustomer = await billingDispatchTyped(
      {
        op: "selectOne",
        table: "convex_billing_customers",
        field: "entityId",
        value: args.entityId,
      },
      context,
      configuration
    );

    let stripeCustomerId = stripeCustomer?.doc?.stripeCustomerId || null;

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

      await billingDispatchTyped(
        {
          op: "upsert",
          table: "convex_billing_customers",
          idField: "entityId",
          data: {
            entityId: args.entityId,
            stripeCustomerId: stripeCustomer.id,
            last_synced_at: Date.now(),
          },
        },
        context,
        configuration
      );

      stripeCustomerId = stripeCustomer.id;
    }

    return { stripeCustomerId };
  },
});
