import Stripe from "stripe";

import { Implementation } from "../helpers";
import { STRIPE_SUB_CACHE } from "../schema/tables";

export const getSubscriptionImplementation: Implementation<
  {
    entityId: string;
  },
  Promise<STRIPE_SUB_CACHE>
> = async (context, args, configuration) => {
  const stripeCustomerId =
    await configuration.persistence.getStripeCustomerIdByEntityId(
      context,
      args.entityId
    );

  if (!stripeCustomerId) {
    return { status: "none" } as STRIPE_SUB_CACHE;
  }

  const data =
    await configuration.persistence.getSubscriptionDataByStripeCustomerId(
      context,
      stripeCustomerId
    );

  if (!data) {
    return { status: "none" } as STRIPE_SUB_CACHE;
  }

  return data as STRIPE_SUB_CACHE;
};
