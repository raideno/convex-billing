import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "../helpers";
import { billingDispatchTyped } from "../operations/helpers";
import { buildSignedReturnUrl } from "./redirects";
import { setupImplementation } from "./setup";

const DEFAULT_CREATE_STRIPE_CUSTOMER_IF_MISSING = true;

export const checkoutImplementation = defineActionImplementation({
  name: "checkout",
  args: {
    createStripeCustomerIfMissing: v.optional(v.boolean()),
    entityId: v.string(),
    priceId: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (
    context,
    args,
    configuration
  ): Promise<{ url: string | null }> => {
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

    let stripeCustomerId = stripeCustomer?.doc?.stripeCustomerId || null;

    if (!stripeCustomerId) {
      if (!createStripeCustomerIfMissing) {
        throw new Error(
          `No Stripe customer ID found for this entityId: ${args.entityId}`
        );
      } else {
        stripeCustomerId = (
          await setupImplementation.handler(
            context,
            {
              entityId: args.entityId,
              email: undefined,
              metadata: undefined,
            },
            configuration
          )
        ).stripeCustomerId;
      }
    }

    const successUrl = await buildSignedReturnUrl(
      configuration,
      "checkout-success",
      args.entityId,
      args.successUrl
    );
    const cancelUrl = await buildSignedReturnUrl(
      configuration,
      "checkout-cancel",
      args.entityId,
      args.cancelUrl
    );

    const checkout = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      ui_mode: "hosted",
      mode: "subscription",
      line_items: [
        {
          price: args.priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return { url: checkout.url };
  },
});
