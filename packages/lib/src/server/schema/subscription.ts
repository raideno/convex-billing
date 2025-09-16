import { Infer, v } from "convex/values";
import Stripe from "stripe";

export const SubscriptionStripeToConvex = (
  subscription: Stripe.Subscription
) => {
  const object: Infer<typeof SubscriptionObject> = {
    ...subscription,
  };
  return object;
};

export const SubscriptionSchema = v.any();

// export const SubscriptionObject = v.object(SubscriptionSchema);
export const SubscriptionObject = v.any();
