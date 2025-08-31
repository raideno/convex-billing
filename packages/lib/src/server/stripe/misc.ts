import Stripe from "stripe";

import { Implementation, STRIPE_SUB_CACHE } from "../helpers";

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

// TODO: expose the limits and features metadata, like transform them
export const getPlansImplementation: Implementation<
  {},
  Promise<
    {
      stripePriceId: string;
      stripeProductId: string;
      name: string;
      description: string | null;
      currency: string;
      amount: number;
      interval: Stripe.Price.Recurring.Interval | undefined;
    }[]
  >
> = async (args, context, configuration) => {
  const stripe = new Stripe(configuration.stripe.secret_key, {
    apiVersion: "2025-08-27.basil",
  });

  // const products = await stripe.products.list({
  //   active: true,
  //   limit: 100,
  // });

  // TODO: instead return the products with their prices expanded
  const prices = await stripe.prices.list({
    active: true,
    limit: 100,
    expand: ["data.product"],
  });

  const plans = prices.data.map((price) => {
    const product = price.product as Stripe.Product;
    return {
      stripePriceId: price.id,
      stripeProductId: product.id,
      name: product.name,
      description: product.description,
      currency: price.currency,
      // NOTE: we divide by 100 cuz Stripe stores prices in the smallest currency unit (e.g., cents for USD)
      amount: (price.unit_amount || 0) / 100,
      interval: price.recurring?.interval, // "month" | "year"
    };
  });

  return plans;
};
