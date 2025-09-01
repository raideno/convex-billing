import Stripe from "stripe";

import { Implementation } from "../helpers";
import { buildSignedReturnUrl } from "./redirects";
import { Infer } from "convex/values";
import { StoreInputValidator } from "../store";

export const getPortalImplementation: Implementation<
  {
    entityId: string;
    returnUrl: string;
  },
  Promise<{ url: string }>
> = async (context, args, configuration) => {
  const stripe = new Stripe(configuration.stripe.secret_key, {
    apiVersion: "2025-08-27.basil",
  });

  const stripeCustomerId = await context.runMutation(configuration.store, {
    type: "getStripeCustomerIdByEntityId",
    entityId: args.entityId,
  } as Infer<typeof StoreInputValidator>);

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
};
