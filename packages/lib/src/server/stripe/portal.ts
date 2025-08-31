import Stripe from "stripe";

import { Implementation } from "../helpers";
import { buildSignedReturnUrl } from "./redirects";

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

  const stripeCustomerId =
    await configuration.persistence.getStripeCustomerIdByEntityId(
      context,
      args.entityId
    );

  if (!stripeCustomerId) {
    throw new Error(
      "No Stripe customer ID found for this entityId: " + args.entityId
    );
  }

  const returnUrl = buildSignedReturnUrl(
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
