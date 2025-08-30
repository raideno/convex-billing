// helpers.ts

import Stripe from "stripe";

import type {
  RegisteredAction,
  RegisteredMutation,
  RegisteredQuery,
  PublicHttpAction,
} from "convex/server";

import { Persistence } from "./persistence";

export const fullfilWithDefaults = (
  metadata: Record<string, any>,
  defaults: Record<string, number>
) => {
  const missingKeys = Object.keys(defaults).filter((key) => !(key in metadata));

  if (missingKeys.length > 0) {
    console.warn(
      `[fullfilWithDefaults] Missing limits: ${missingKeys.join(", ")}. Using default values.`
    );
  }

  return { ...defaults, ...metadata };
};

export const extractFromMetadata = (
  prefix: string,
  metadata: Record<string, any>,
  defaults: Record<string, number>
) => {
  metadata = fullfilWithDefaults(metadata, defaults);

  const limits = Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, value]) => {
        if (typeof value !== "number") {
          console.warn(
            `[extractFromMetadata] Invalid limit for "${key}" (got ${typeof value}), falling back to default.`
          );
          return [key, defaults[key]];
        }
        return [key, value];
      })
  ) as Record<string, number>;

  return limits;
};

// TODO: make sure that none of the fields can be null
export type STRIPE_SUB_CACHE =
  | {
      subscriptionId: string;
      status: Stripe.Subscription.Status;
      priceId: string;
      currentPeriodStart: number;
      currentPeriodEnd: number;
      cancelAtPeriodEnd: boolean;
      limits: Record<string, number>;
      paymentMethod: {
        brand: string | null; // e.g., "visa", "mastercard"
        last4: string | null; // e.g., "4242"
      } | null;
    }
  | {
      status: "none";
    };

export interface Configuration {
  redis?: {
    url: string;
    write_token: string;
    read_token: string;
  };

  stripe_secret_key: string;
  stripe_webhook_secret: string;
  stripe_publishable_key: string;

  credits_initial_usage_value: number;

  metadata_limits_key_prefix: string;
  metadata_features_key_prefix: string;

  default_limits: Record<string, number>;
  default_features: Record<string, number>;

  default_portal_return_url: string;

  default_checkout_success_url: string;
  default_checkout_cancel_url: string;
  default_checkout_return_url: string;

  // TODO: customer's default plan when they sign up. put it as optional
  default_price_id: string;
}

export type RegisteredFunction =
  | RegisteredAction<any, any, any>
  | RegisteredMutation<any, any, any>
  | RegisteredQuery<any, any, any>
  | PublicHttpAction;

export type ConvexFunctionFactory = (
  configuration: Configuration,
  store: Persistence
) => RegisteredFunction;
