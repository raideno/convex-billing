import type { Infer, Validator } from "convex/values";
import { v } from "convex/values";

import { InternalConfiguration } from "../helpers";
import { MutationCtx } from "../schema/tables";
import { getStripeCustomerIdByEntityId } from "./getStripeCustomerIdByEntityId";
import { getSubscriptionDataByStripeCustomerId } from "./getSubscriptionDataByStripeCustomerId";
import { persistPrices } from "./persistPrices";
import { persistProducts } from "./persistProducts";
import { persistStripeCustomerId } from "./persistStripeCustomerId";
import { persistSubscriptionData } from "./persistSubscriptionData";

type ArgSchema = Record<string, Validator<any>>;
type InferArgs<S extends ArgSchema> = { [K in keyof S]: Infer<S[K]> };

export type IdkHowToNameThis<S extends ArgSchema> = {
  args: S;
  type: string;
  handler: (
    context: MutationCtx,
    args: InferArgs<S>,
    configuration: InternalConfiguration
  ) => any | Promise<any>;
};

export const define = <S extends ArgSchema>(spec: IdkHowToNameThis<S>) => spec;

export const mutations = [
  persistStripeCustomerId,
  getStripeCustomerIdByEntityId,
  persistSubscriptionData,
  getSubscriptionDataByStripeCustomerId,
  persistProducts,
  persistPrices,
] as const;

export const StoreInputValidator = v.union(
  v.object({
    type: v.literal("persistStripeCustomerId"),
    ...persistStripeCustomerId.args,
  }),
  v.object({
    type: v.literal("getStripeCustomerIdByEntityId"),
    ...getStripeCustomerIdByEntityId.args,
  }),
  v.object({
    type: v.literal("persistSubscriptionData"),
    ...persistSubscriptionData.args,
  }),
  v.object({
    type: v.literal("getSubscriptionDataByStripeCustomerId"),
    ...getSubscriptionDataByStripeCustomerId.args,
  }),
  v.object({
    type: v.literal("persistProducts"),
    ...persistProducts.args,
  }),
  v.object({
    type: v.literal("persistPrices"),
    ...persistPrices.args,
  })
);

export const storeImplementation = async (
  context: MutationCtx,
  args: Infer<typeof StoreInputValidator>,
  configuration: InternalConfiguration
) => {
  const mutation = mutations.find((m) => m.type === args.type);
  if (!mutation) {
    throw new Error(`Unknown mutation type: ${(args as any).data.type}`);
  }
  return await mutation.handler(context, args as any, configuration);
};
