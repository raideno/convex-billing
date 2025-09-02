import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "../helpers";
import { StoreImplementation } from "../types";
import { buildSignedReturnUrl } from "./redirects";

export const checkoutImplementation = defineActionImplementation({
  name: "checkout",
  args: {
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
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const stripeCustomerId = (await context.runMutation(
      configuration.store as StoreImplementation,
      {
        args: {
          name: "getStripeCustomerIdByEntityId",
          entityId: args.entityId,
        },
      }
    )) as string | null;

    if (!stripeCustomerId) {
      throw new Error(
        "No Stripe customer ID found for this entityId: " + args.entityId
      );
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
