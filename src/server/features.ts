// features.ts

import Stripe from "stripe";

import {
  InternalConfiguration,
  extractFromMetadata,
  Implementation,
} from "./helpers";

export const extractFeaturesFromMetadata = (
  configuration: InternalConfiguration,
  metadata: Record<string, any>
) => extractFromMetadata(configuration.metadata_features_key_prefix, metadata);

export const getFeaturesImplementation: Implementation<{
  priceId: string;
}> = async (context, args, configuration) => {
  const stripe = new Stripe(configuration.stripe.secret_key, {
    apiVersion: "2025-08-27.basil",
  });

  const price = await stripe.prices.retrieve(args.priceId);

  const limits = extractFeaturesFromMetadata(
    configuration,
    (price.metadata || {}) as Record<string, any>
  );

  return limits;
};
