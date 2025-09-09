import { GenericActionCtx } from "convex/server";
import { v } from "convex/values";

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
    },
    debug: false,
    logger: new Logger(config.debug || false),
    base: config.base || "billing",
  };
};
export const defineActionImplementation = <S extends ArgSchema, R>(spec: {
  args: S;
  name: string;
  handler: (
    context: GenericActionCtx<BillingDataModel>,
    args: InferArgs<S>,
    configuration: InternalConfiguration
  ) => R;
}) => spec;

export const nullablestring = () => v.union(v.string(), v.null());
export const nullableboolean = () => v.union(v.boolean(), v.null());
export const nullablenumber = () => v.union(v.number(), v.null());
export const metadata = () => v.union(v.null(), v.record(v.string(), v.any()));
