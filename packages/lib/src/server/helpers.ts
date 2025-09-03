import { anyApi, GenericActionCtx } from "convex/server";
import { v } from "convex/values";

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
    store: config.store || anyApi.billing.store,
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
export const metadata = () => v.record(v.string(), v.any());
