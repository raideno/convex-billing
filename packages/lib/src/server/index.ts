import {
  HttpRouter,
  internalActionGeneric,
  internalMutationGeneric,
} from "convex/server";
import { v } from "convex/values";

import { getFeaturesImplementation } from "./features";
import { InputConfiguration, normalizeConfiguration } from "./helpers";
import { getLimitsImplementation } from "./limits";
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

export { billingTables } from "./tables";

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
      args: StoreInputValidator,
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
    // --- --- --- limits.ts
    getLimits: internalActionGeneric({
      args: {
        priceId: v.string(),
      },
      handler: (context, args) =>
        getLimitsImplementation(context, args, configuration),
    }),
    // --- --- --- features.ts
    getFeatures: internalActionGeneric({
      args: {
        priceId: v.string(),
      },
      handler: (context, args) =>
        getFeaturesImplementation(context, args, configuration),
    }),
  };
};
