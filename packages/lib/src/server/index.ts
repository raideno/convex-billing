import {
  AnyDataModel,
  Crons,
  GenericActionCtx,
  GenericMutationCtx,
  HttpRouter,
  internalActionGeneric,
  internalMutationGeneric,
} from "convex/server";

import {
  PayImplementation,
  PortalImplementation,
  SetupImplementation,
  SubscribeImplementation,
} from "./actions";
import { normalizeConfiguration } from "./helpers";
import { buildRedirectImplementation } from "./redirects";
import { StoreImplementation } from "./store";
import { SyncAllImplementation } from "./sync/all";
import { InputConfiguration } from "./types";
import { buildWebhookImplementation } from "./webhooks";
import { Infer } from "convex/values";
import { BillingDataModel } from "./schema";

export * from "./schema";

export * from "./types";

export * from "./helpers";

export const internalConvexBilling = (configuration_: InputConfiguration) => {
  const configuration = normalizeConfiguration(configuration_);

  return {
    billing: {
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
      addCronJobs: (crons: Crons) => {
        crons.interval(
          "stripe sync",
          { hours: 1 },
          `${configuration.base}:sync` as any
        );
      },
      portal: (
        context: GenericActionCtx<BillingDataModel>,
        args: Infer<typeof PortalImplementation.args>
      ) => PortalImplementation.handler(context, args, configuration),
      subscribe: (
        context: GenericActionCtx<BillingDataModel>,
        args: Infer<typeof SubscribeImplementation.args>
      ) => SubscribeImplementation.handler(context, args, configuration),
      pay: (
        context: GenericActionCtx<BillingDataModel>,
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
