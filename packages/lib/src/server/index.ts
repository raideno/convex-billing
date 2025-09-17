import {
  GenericActionCtx,
  HttpRouter,
  internalActionGeneric,
  internalMutationGeneric,
} from "convex/server";
import { Infer } from "convex/values";

import {
  PayImplementation,
  PortalImplementation,
  SetupImplementation,
  SubscribeImplementation,
} from "./actions";
import { normalizeConfiguration } from "./helpers";
import { buildRedirectImplementation } from "./redirects";
import { StripeDataModel } from "./schema";
import { StoreImplementation } from "./store";
import { SyncAllImplementation } from "./sync/all";
import { InputConfiguration } from "./types";
import { buildWebhookImplementation } from "./webhooks";

export * from "./schema";

export * from "./types";

export * from "./helpers";

export const internalConvexStripe = (configuration_: InputConfiguration) => {
  const configuration = normalizeConfiguration(configuration_);

  return {
    stripe: {
      addHttpRoutes: (http: HttpRouter) => {
        http.route({
          path: "/stripe/webhook",
          method: "POST",
          handler: buildWebhookImplementation(configuration),
        });
        http.route({
          pathPrefix: "/stripe/return/",
          method: "GET",
          handler: buildRedirectImplementation(configuration),
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
    // --- --- ---
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
