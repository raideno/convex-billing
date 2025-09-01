import Stripe from "stripe";

import { Implementation } from "../helpers";
import { STRIPE_SUB_CACHE } from "../schema/tables";
import { Infer } from "convex/values";
import { StoreInputValidator } from "../store";

export const syncAllPricesImplementation: Implementation<any, any> = async (
  context,
  args,
  configuration
) => {
  const stripe = new Stripe(configuration.stripe.secret_key, {
    apiVersion: "2025-08-27.basil",
  });

  const response = await stripe.prices.list({
    limit: 100,
  });

  if (response.has_more)
    console.warn("There are more than 100 prices, pagination not implemented");

  const prices = response.data;

  await context.runMutation(configuration.store, {
    type: "persistPrices",
    prices: prices,
  } as Infer<typeof StoreInputValidator>);

  return prices;
};

export const syncAllProductsImplementation: Implementation<any, any> = async (
  context,
  args,
  configuration
) => {
  const stripe = new Stripe(configuration.stripe.secret_key, {
    apiVersion: "2025-08-27.basil",
  });

  const response = await stripe.products.list({
    limit: 100,
  });

  if (response.has_more)
    console.warn(
      "There are more than 100 products, pagination not implemented"
    );

  const products = response.data;

  await context.runMutation(configuration.store, {
    type: "persistProducts",
    products: products,
  } as Infer<typeof StoreInputValidator>);

  return products;
};

export const syncSubscriptionImplementation: Implementation<
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
    await context.runMutation(configuration.store, {
      type: "persistSubscriptionData",
      stripeCustomerId: stripeCustomerId,
      data: data,
    } as Infer<typeof StoreInputValidator>);

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
    paymentMethod:
      subscription.default_payment_method &&
      typeof subscription.default_payment_method !== "string"
        ? {
            brand: subscription.default_payment_method.card?.brand ?? null,
            last4: subscription.default_payment_method.card?.last4 ?? null,
          }
        : null,
  };

  await context.runMutation(configuration.store, {
    type: "persistSubscriptionData",
    stripeCustomerId: stripeCustomerId,
    data: data,
  } as Infer<typeof StoreInputValidator>);

  return data;
};
