import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "../helpers";
import { billingDispatchTyped } from "../operations/helpers";
import { buildSignedReturnUrl } from "./redirects";
import { setupImplementation } from "./setup";

const DEFAULT_CREATE_STRIPE_CUSTOMER_IF_MISSING = true;

export const portalImplementation = defineActionImplementation({
  name: "getPortal",
  args: {
    createStripeCustomerIfMissing: v.optional(v.boolean()),
    entityId: v.string(),
    returnUrl: v.string(),
  },
  handler: async (context, args, configuration) => {
    const createStripeCustomerIfMissing =
      args.createStripeCustomerIfMissing ??
      DEFAULT_CREATE_STRIPE_CUSTOMER_IF_MISSING;

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

    let customerId = stripeCustomer?.doc?.customerId || null;

    if (!customerId) {
      if (!createStripeCustomerIfMissing) {
        throw new Error(
          `No Stripe customer ID found for this entityId: ${args.entityId}`
        );
      } else {
        customerId = (
          await setupImplementation.handler(
            context,
            {
              entityId: args.entityId,
              email: undefined,
              metadata: undefined,
            },
            configuration
          )
        ).customerId;
      }
    }

    const returnUrl = await buildSignedReturnUrl(
      configuration,
      "portal",
      args.entityId,
      args.returnUrl
    );

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return portal;
  },
});
