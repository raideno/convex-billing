import Stripe from "stripe";

import { Implementation } from "../helpers";
import { STRIPE_SUB_CACHE } from "../tables";

export const syncImplementation: Implementation<
  {
    stripeCustomerId: string;
  },
  Promise<STRIPE_SUB_CACHE>
> = async (context, args, configuration) => {
  const stripe = new Stripe(configuration.stripe.secret_key, {
    apiVersion: "2025-08-27.basil",
  });

  const stripeCustomerId = args.stripeCustomerId;

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    limit: 1,
    status: "all",
    expand: ["data.default_payment_method"],
  });

  if (subscriptions.data.length === 0) {
    const data = { status: "none" };
    await configuration.persistence.persistSubscriptionData(context, {
      stripeCustomerId,
      data,
    });
    return data as STRIPE_SUB_CACHE;
  }

  // TODO: here we select the first cuz entities can only have one subscription
  const subscription = subscriptions.data[0];

  const data: STRIPE_SUB_CACHE = {
    subscriptionId: subscription.id,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
    // TODO: be sure of the items thing
    currentPeriodEnd: subscription.items.data[0].current_period_end,
    // TODO: be sure of the items thing
    currentPeriodStart: subscription.items.data[0].current_period_start,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    metadata: subscription.items.data[0].price.metadata,
    paymentMethod:
      subscription.default_payment_method &&
      typeof subscription.default_payment_method !== "string"
        ? {
            brand: subscription.default_payment_method.card?.brand ?? null,
            last4: subscription.default_payment_method.card?.last4 ?? null,
          }
        : null,
  };

  await configuration.persistence.persistSubscriptionData(context, {
    stripeCustomerId,
    data,
  });

  return data;
};
