import Stripe from "stripe";

import { Implementation } from "../helpers";
import { buildSignedReturnUrl } from "./redirects";

export const checkoutImplementation: Implementation<
  {
    entityId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  },
  Promise<{ url: string | null }>
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

  const successUrl = buildSignedReturnUrl(
    configuration,
    "checkout-success",
    args.entityId,
    args.successUrl
  );
  const cancelUrl = buildSignedReturnUrl(
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
};
