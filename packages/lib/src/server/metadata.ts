import Stripe from "stripe";

import { Implementation } from "./helpers";

export const getMetadataImplementation: Implementation<
  {
    priceId: string;
  },
  Record<string, any>
> = async (context, args, configuration) => {
  const stripe = new Stripe(configuration.stripe.secret_key, {
    apiVersion: "2025-08-27.basil",
  });

  const price = await stripe.prices.retrieve(args.priceId);

  return price.metadata;
};
