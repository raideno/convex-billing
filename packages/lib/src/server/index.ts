import {
  HttpRouter,
  internalActionGeneric,
  internalMutationGeneric,
} from "convex/server";
import { v } from "convex/values";

import { getMetadataImplementation } from "./metadata";
import { InputConfiguration, normalizeConfiguration } from "./helpers";
import {
  buildRedirectImplementation,
  buildWebhookImplementation,
  checkoutImplementation,
  createStripeCustomerImplementation,
  getPlansImplementation,
  getPortalImplementation,
  getSubscriptionImplementation,
  syncImplementation,
} from "./stripe";
import { storeImplementation, StoreInputValidator } from "./store";

export * from "./persistence/types";
export * from "./tables";

export * from "./helpers";

export type { InputConfiguration, InternalConfiguration } from "./helpers";

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
      args: v.any(),
      handler: (context, args) =>
        storeImplementation(context, args, configuration),
    }),
    // --- --- --- stripe.ts
    getPortal: internalActionGeneric({
      args: {
        entityId: v.string(),
        returnUrl: v.string(),
      },
      handler: (context, args) =>
        getPortalImplementation(context, args, configuration),
    }),
    checkout: internalActionGeneric({
      args: {
        entityId: v.string(),
        priceId: v.string(),
        successUrl: v.string(),
        cancelUrl: v.string(),
      },
      handler: (context, args) =>
        checkoutImplementation(context, args, configuration),
    }),
    createStripeCustomer: internalActionGeneric({
      args: {
        entityId: v.string(),
      },
      handler: (context, args) =>
        createStripeCustomerImplementation(context, args, configuration),
    }),
    sync: internalActionGeneric({
      args: {
        stripeCustomerId: v.string(),
      },
      handler: (context, args) =>
        syncImplementation(context, args, configuration),
    }),
    getSubscription: internalActionGeneric({
      args: {
        entityId: v.string(),
      },
      handler: (context, args) =>
        getSubscriptionImplementation(context, args, configuration),
    }),
    webhook: buildWebhookImplementation(configuration),
    getPlans: internalActionGeneric({
      args: {},
      handler: (context, args) =>
        getPlansImplementation(context, args, configuration),
    }),
    // --- --- --- metadata.ts
    getMetadata: internalActionGeneric({
      args: {
        priceId: v.string(),
      },
      handler: (context, args) =>
        getMetadataImplementation(context, args, configuration),
    }),
  };
};
