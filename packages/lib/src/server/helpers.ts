import { GenericActionCtx, GenericMutationCtx } from "convex/server";
import { Infer, v, VObject } from "convex/values";

import { Logger } from "@/logger";
import { StripeDataModel } from "@/schema";
import {
  ArgSchema,
  InferArgs,
  InputConfiguration,
  InternalConfiguration,
} from "@/types";

export const normalizeConfiguration = (
  config: InputConfiguration
): InternalConfiguration => {
  return {
    ...config,
    redirectTtlMs: 15 * 60 * 1000,
    sync: {
      stripeCoupons: true,
      stripeCustomers: true,
      stripePrices: true,
      stripeProducts: true,
      stripePromotionCodes: true,
      stripeSubscriptions: true,
      stripePayouts: true,
      stripeCheckoutSessions: true,
      stripePaymentIntents: true,
      stripeRefunds: true,
      stripeInvoices: true,
      stripeReviews: true,
      stripeCharges: true,
      stripeCreditNotes: true,
      stripeDisputes: true,
      stripeEarlyFraudWarnings: true,
      stripePaymentMethods: true,
      stripePlans: true,
      stripeSetupIntents: true,
      stripeSubscriptionSchedules: true,
      stripeTaxIds: true,
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
