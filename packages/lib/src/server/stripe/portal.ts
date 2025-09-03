import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "../helpers";
import { billingDispatchTyped } from "../operations/helpers";
import { buildSignedReturnUrl } from "./redirects";

export const getPortalImplementation = defineActionImplementation({
  name: "getPortal",
  args: {
    entityId: v.string(),
    returnUrl: v.string(),
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

    const stripeCustomerId = stripeCustomer?.doc?.stripeCustomerId || null;

    if (!stripeCustomerId) {
      throw new Error(
        "No Stripe customer ID found for this entityId: " + args.entityId
      );
    }

    const returnUrl = await buildSignedReturnUrl(
      configuration,
      "portal",
      args.entityId,
      args.returnUrl
    );

    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: portal.url };
  },
});
