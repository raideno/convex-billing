import Stripe from "stripe";

import {
  extractFromMetadata,
  Implementation,
  InternalConfiguration,
} from "./helpers";

export const extractLimitsFromMetadata = (
  configuration: InternalConfiguration,
  metadata: Record<string, any>
) =>
  extractFromMetadata(
    configuration.metadata_limits_key_prefix,
    metadata,
    configuration.defaults.limits
  );

export const getLimitsImplementation: Implementation<
  {
    priceId: string;
  },
  Record<string, any>
> = async (context, args, configuration) => {
  const stripe = new Stripe(configuration.stripe.secret_key, {
    apiVersion: "2025-08-27.basil",
  });

  const price = await stripe.prices.retrieve(args.priceId);

  const limits = extractLimitsFromMetadata(
    configuration,
    (price.metadata || {}) as Record<string, any>
  );

  return limits;
};
