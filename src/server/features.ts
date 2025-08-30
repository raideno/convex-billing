// features.ts

import Stripe from "stripe";

import { Configuration, extractFromMetadata, Implementation } from "./helpers";

export const extractFeaturesFromMetadata = (
  configuration: Configuration,
  metadata: Record<string, any>
) =>
  extractFromMetadata(
    configuration.metadata_features_key_prefix,
    metadata,
    configuration.default_features
  );

export const getFeaturesImplementation: Implementation<{
  priceId: string;
}> = async (args, kv, context, configuration) => {
  const stripe = new Stripe(configuration.stripe_secret_key, {
    apiVersion: "2025-08-27.basil",
  });

  const price = await stripe.prices.retrieve(args.priceId);

  const limits = extractFeaturesFromMetadata(
    configuration,
    (price.metadata || {}) as Record<string, any>
  );

  return limits;
};
