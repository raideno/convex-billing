import { Infer } from "convex/values";
import Stripe from "stripe";

import { Implementation } from "../helpers";
import { StoreInputValidator } from "../store";

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

  let stripeCustomerId = await context.runMutation(configuration.store, {
    type: "getStripeCustomerIdByEntityId",
    entityId: args.entityId,
  } as Infer<typeof StoreInputValidator>);

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

    await context.runMutation(configuration.store, {
      type: "persistStripeCustomerId",
      entityId: args.entityId,
    } as Infer<typeof StoreInputValidator>);

    stripeCustomerId = stripeCustomer.id;
  }

  return { stripeCustomerId };
};
