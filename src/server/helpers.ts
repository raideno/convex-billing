// helpers.ts

import Stripe from "stripe";
import { Context, Persistence } from "./persistence";

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
  defaults: Record<string, number> = {}
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

export interface InternalConfiguration {
  redis: {
    url: string;
    write_token: string;
    read_token: string;
  };

  stripe: {
    secret_key: string;
    webhook_secret: string;
    publishable_key: string;
  };

  defaults: {
    portal_return_url: string;
    checkout_success_url: string;
    checkout_cancel_url: string;
    checkout_return_url: string;
    limits?: Record<string, number>;
  };

  credits_initial_usage_value: number;

  metadata_limits_key_prefix: string;
  metadata_features_key_prefix: string;
}

export type WithOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type InputConfiguration = WithOptional<
  InternalConfiguration,
  | "metadata_limits_key_prefix"
  | "metadata_features_key_prefix"
  | "credits_initial_usage_value"
>;

export const normalizeConfiguration = (
  config: InputConfiguration
): InternalConfiguration => {
  return {
    ...config,
    metadata_limits_key_prefix: config.metadata_limits_key_prefix ?? "limits:",
    metadata_features_key_prefix:
      config.metadata_features_key_prefix ?? "features:",

    credits_initial_usage_value: config.credits_initial_usage_value ?? 0,
  };
};

export type Implementation<T extends Record<string, any>> = (
  args: T,
  kv: Persistence,
  context: Context,
  configuration: InternalConfiguration
) => Promise<any>;
