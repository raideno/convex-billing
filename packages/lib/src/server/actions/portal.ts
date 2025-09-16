import { v } from "convex/values";
import Stripe from "stripe";

import { SetupImplementation } from "@/actions/setup";
import { buildSignedReturnUrl } from "@/redirects";
import { billingDispatchTyped } from "@/store";

import { defineActionImplementation } from "../helpers";

const DEFAULT_CREATE_STRIPE_CUSTOMER_IF_MISSING = true;

export const PortalImplementation = defineActionImplementation({
  name: "portal",
  args: v.object({
    createStripeCustomerIfMissing: v.optional(v.boolean()),
    entityId: v.string(),
    return: v.object({
      url: v.string(),
    }),
  }),
  handler: async (context, args, configuration) => {
    const createStripeCustomerIfMissing =
      args.createStripeCustomerIfMissing ??
      DEFAULT_CREATE_STRIPE_CUSTOMER_IF_MISSING;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const stripeCustomer = await billingDispatchTyped(
      {
        operation: "selectOne",
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
          await SetupImplementation.handler(
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

    const returnUrl = await buildSignedReturnUrl({
      configuration: configuration,
      origin: "portal-return",
      data: {
        entityId: args.entityId,
      },
      targetUrl: args.return.url,
    });

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return portal;
  },
});
