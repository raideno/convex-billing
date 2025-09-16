import { GenericActionCtx, GenericMutationCtx } from "convex/server";
import { Infer, v, VObject } from "convex/values";

import { Logger } from "./logger";
import { BillingDataModel } from "./schema";
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
      convex_billing_coupons: true,
      convex_billing_customers: true,
      convex_billing_prices: true,
      convex_billing_products: true,
      convex_billing_promotion_codes: true,
      convex_billing_subscriptions: true,
      convex_billing_payouts: true,
      convex_billing_checkout_sessions: true,
      convex_billing_payment_intents: true,
      convex_billing_refunds: true,
    },
    debug: false,
    logger: new Logger(config.debug || false),
    base: config.base || "billing",
  };
};

export const defineActionImplementation = <
  S extends VObject<any, any>,
  R,
>(spec: {
  args: S;
  name: string;
  handler: (
    context: GenericActionCtx<BillingDataModel>,
    args: Infer<S>,
    configuration: InternalConfiguration
  ) => R;
}) => spec;

export const defineMutationImplementation = <S extends ArgSchema, R>(spec: {
  args: S;
  name: string;
  handler: (
    context: GenericMutationCtx<BillingDataModel>,
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
