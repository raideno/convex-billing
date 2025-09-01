import { anyApi } from "convex/server";

import { GenericActionCtx, GenericMutationCtx } from "convex/server";

export type Context =
  // | GenericQueryCtx<any>
  GenericActionCtx<any> | GenericMutationCtx<any>;

export interface InternalConfiguration {
  stripe: {
    secret_key: string;
    webhook_secret: string;
    publishable_key: string;
  };

  convex: { projectId: string };

  store: any;
}

export type WithOptional<T, K extends keyof T = never> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type InputConfiguration = WithOptional<InternalConfiguration, "store">;

export const normalizeConfiguration = (
  config: InputConfiguration
): InternalConfiguration => {
  return {
    ...config,
    store: config.store || anyApi.billing.store,
  };
};

export type Implementation<T extends Record<string, any>, R> = (
  context: Context,
  args: T,
  configuration: InternalConfiguration
) => R;
