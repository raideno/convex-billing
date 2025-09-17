import { GenericActionCtx, GenericMutationCtx } from "convex/server";
import { Infer, v, VObject } from "convex/values";

import { Logger } from "./logger";
import { StripeDataModel } from "./schema";
import {
  ArgSchema,
  InferArgs,
  InputConfiguration,
  InternalConfiguration,
} from "./types";

export const normalizeConfiguration = (
  config: InputConfiguration
): InternalConfiguration => {
  return {
    ...config,
    sync: {
      stripe_coupons: true,
      stripe_customers: true,
      stripe_prices: true,
      stripe_products: true,
      stripe_promotion_codes: true,
      stripe_subscriptions: true,
      stripe_payouts: true,
      stripe_checkout_sessions: true,
      stripe_payment_intents: true,
      stripe_refunds: true,
      stripe_invoices: true,
      stripe_reviews: true,
    },
    debug: false,
    logger: new Logger(config.debug || false),
    base: config.base || "stripe",
  };
};

export const defineActionImplementation = <
  S extends VObject<any, any>,
  R,
>(spec: {
  args: S;
  name: string;
  handler: (
    context: GenericActionCtx<StripeDataModel>,
    args: Infer<S>,
    configuration: InternalConfiguration
  ) => R;
}) => spec;

export const defineMutationImplementation = <S extends ArgSchema, R>(spec: {
  args: S;
  name: string;
  handler: (
    context: GenericMutationCtx<StripeDataModel>,
    args: InferArgs<S>,
    configuration: InternalConfiguration
  ) => R;
}) => spec;

export const nullablestring = () => v.union(v.string(), v.null());
export const nullableboolean = () => v.union(v.boolean(), v.null());
export const nullablenumber = () => v.union(v.number(), v.null());
export const metadata = () =>
  v.record(v.string(), v.union(v.string(), v.number(), v.null()));
export const optionalnullableobject = <T extends ArgSchema>(object: T) =>
  v.optional(v.union(v.object(object), v.null()));
