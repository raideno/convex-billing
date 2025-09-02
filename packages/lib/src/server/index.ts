import {
  HttpRouter,
  internalActionGeneric,
  internalMutationGeneric,
} from "convex/server";
import { v } from "convex/values";

import { normalizeConfiguration } from "./helpers";
import { storeImplementation, StoreInputValidator } from "./store";
import {
  buildRedirectImplementation,
  buildWebhookImplementation,
  checkoutImplementation,
  createStripeCustomerImplementation,
  getPortalImplementation,
} from "./stripe";
import { InputConfiguration } from "./types";

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
    },
    store: internalMutationGeneric({
      args: StoreInputValidator,
      handler: (context, args) =>
        storeImplementation.handler(context, args, configuration),
    }),
    // --- --- --- stripe.ts
    portal: internalActionGeneric({
      args: {
        entityId: v.string(),
        returnUrl: v.string(),
      },
      handler: (context, args) =>
        getPortalImplementation.handler(context, args, configuration),
    }),
    checkout: internalActionGeneric({
      args: {
        entityId: v.string(),
        priceId: v.string(),
        successUrl: v.string(),
        cancelUrl: v.string(),
      },
      handler: (context, args) =>
        checkoutImplementation.handler(context, args, configuration),
    }),
    createStripeCustomer: internalActionGeneric({
      args: {
        entityId: v.string(),
        email: v.optional(v.string()),
        metadata: v.optional(v.record(v.string(), v.any())),
      },
      handler: (context, args) =>
        createStripeCustomerImplementation.handler(
          context,
          {
            email: args.entityId,
            entityId: args.entityId,
            metadata: args.metadata,
          },
          configuration
        ),
    }),
  };
};
