import Stripe from "stripe";

import { Implementation } from "../helpers";

export const createStripeCustomerImplementation: Implementation<
  {
    entityId: string;
    email?: string;
    metadata?: Record<string, any>;
  },
  Promise<{ stripeCustomerId: string }>
> = async (context, args, configuration) => {
  const stripe = new Stripe(configuration.stripe.secret_key, {
    apiVersion: "2025-08-27.basil",
  });

  let stripeCustomerId =
    await configuration.persistence.getStripeCustomerIdByEntityId(
      context,
      args.entityId
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

    await configuration.persistence.persistStripeCustomerId(context, {
      stripeCustomerId: stripeCustomer.id,
      entityId: args.entityId,
    });

    stripeCustomerId = stripeCustomer.id;
  }

  return { stripeCustomerId };
};
