import { GenericActionCtx } from "convex/server";

import { BillingDataModel } from "@/schema";
import { ArgSchema, InferArgs, InternalConfiguration } from "@/types";

export type RedirectHandler<
  TOrigins extends readonly string[],
  S extends ArgSchema = {},
> = {
  origins: TOrigins;
  data?: S;
  handle: (
    origin: TOrigins[number],
    context: GenericActionCtx<BillingDataModel>,
    data: InferArgs<S>,
    configuration: InternalConfiguration
  ) => Promise<void>;
};

export function defineRedirectHandler<
  const T extends readonly string[],
  S extends ArgSchema = {},
>(handler: RedirectHandler<T, S>): RedirectHandler<T, S> {
  return handler;
}
