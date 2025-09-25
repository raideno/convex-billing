import {
  GenericActionCtx,
  GenericDataModel,
  httpActionGeneric,
  HttpRouter,
  internalActionGeneric,
  internalMutationGeneric,
  RoutableMethod,
} from "convex/server";
import { Infer } from "convex/values";
import Stripe from "stripe";
import {
  PayImplementation,
  PortalImplementation,
  SetupImplementation,
  SubscribeImplementation,
} from "./actions";
import { normalizeConfiguration } from "./helpers";
import { redirectImplementation } from "./redirects";
import { StripeDataModel } from "./schema";
import { StoreImplementation } from "./store";
import { SyncAllImplementation } from "./sync/all";
import type { InputConfiguration, InternalConfiguration } from "./types";
import { webhookImplementation } from "./webhooks";

export { stripeTables } from "./schema";

export { Logger } from "./logger";

export { InputConfiguration };

const buildHttp = (configuration: InternalConfiguration) => ({
  webhook: {
    path: "/stripe/webhook",
    method: "POST" as const as RoutableMethod,
    handler: (
      context: GenericActionCtx<GenericDataModel>,
      request: Request,
      stripe?: Stripe
    ) => {
      return webhookImplementation(
        configuration,
        context as unknown as GenericActionCtx<StripeDataModel>,
        request,
        stripe
      );
    },
  },
  redirect: {
    pathPrefix: "/stripe/return/",
    method: "GET" as const as RoutableMethod,
    handler: (
      context: GenericActionCtx<GenericDataModel>,
      request: Request
    ) => {
      return redirectImplementation(
        configuration,
        context as unknown as GenericActionCtx<StripeDataModel>,
        request
      );
    },
  } as const,
});

export const internalConvexStripe = (configuration_: InputConfiguration) => {
  const configuration = normalizeConfiguration(configuration_);
  const http_ = buildHttp(configuration);

  return {
    stripe: {
      http: http_,
      addHttpRoutes: (http: HttpRouter, config?: InputConfiguration) => {
        config = normalizeConfiguration(config || configuration_);
        http.route({
          path: http_.webhook.path,
          method: http_.webhook.method,
          handler: httpActionGeneric((context, request) => {
            return http_.webhook.handler(context, request);
          }),
        });
        http.route({
          pathPrefix: http_.redirect.pathPrefix,
          method: http_.redirect.method,
          handler: httpActionGeneric((context, request) => {
            return http_.redirect.handler(context, request);
          }),
        });
      },
      portal: (
        context: GenericActionCtx<StripeDataModel>,
        args: Infer<typeof PortalImplementation.args>
      ) => PortalImplementation.handler(context, args, configuration),
      subscribe: (
        context: GenericActionCtx<StripeDataModel>,
        args: Infer<typeof SubscribeImplementation.args>
      ) => SubscribeImplementation.handler(context, args, configuration),
      pay: (
        context: GenericActionCtx<StripeDataModel>,
        args: Infer<typeof PayImplementation.args>
      ) => PayImplementation.handler(context, args, configuration),
    },
    store: internalMutationGeneric({
      args: StoreImplementation.args,
      handler: async (context, args) =>
        StoreImplementation.handler(context, args, configuration),
    }),
    sync: internalActionGeneric({
      args: SyncAllImplementation.args,
      handler: (context, args) =>
        SyncAllImplementation.handler(context, args, configuration),
    }),
    setup: internalActionGeneric({
      args: SetupImplementation.args,
      handler: (context, args) =>
        SetupImplementation.handler(context, args, configuration),
    }),
  };
};
