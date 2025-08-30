// features.ts

import Stripe from "stripe";

import { v } from "convex/values";
import { internalActionGeneric } from "convex/server";

import {
  Configuration,
  ConvexFunctionFactory,
  extractFromMetadata,
} from "./helpers";

export const extractFeaturesFromMetadata = (
  configuration: Configuration,
  metadata: Record<string, any>
) =>
  extractFromMetadata(
    configuration.metadata_features_key_prefix,
    metadata,
    configuration.default_features
  );

// TODO: implement caching
export const buildGet: ConvexFunctionFactory = (configuration, kv) =>
  internalActionGeneric({
    args: { priceId: v.string() },
    handler: async (context, args) => {
      const stripe = new Stripe(configuration.stripe_secret_key, {
        apiVersion: "2025-08-27.basil",
      });

      const price = await stripe.prices.retrieve(args.priceId);

      const limits = extractFeaturesFromMetadata(
        configuration,
        (price.metadata || {}) as Record<string, any>
      );

      return limits;
    },
  });
