import { Infer } from "convex/values";

import { Implementation } from "../helpers";
import { STRIPE_SUB_CACHE } from "../schema/tables";
import { StoreInputValidator } from "../store";

export const getSubscriptionImplementation: Implementation<
  {
    entityId: string;
  },
  Promise<STRIPE_SUB_CACHE>
> = async (context, args, configuration) => {
  const stripeCustomerId = await context.runMutation(configuration.store, {
    type: "getStripeCustomerIdByEntityId",
    entityId: args.entityId,
  } as Infer<typeof StoreInputValidator>);

  if (!stripeCustomerId) {
    return { status: "none" } as STRIPE_SUB_CACHE;
  }

  const data = await context.runMutation(configuration.store, {
    type: "getSubscriptionDataByStripeCustomerId",
    stripeCustomerId: stripeCustomerId,
  } as Infer<typeof StoreInputValidator>);

  if (!data) {
    return { status: "none" } as STRIPE_SUB_CACHE;
  }

  return data as STRIPE_SUB_CACHE;
};
