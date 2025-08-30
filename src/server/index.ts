// index.ts

import { HttpRouter, internalActionGeneric } from "convex/server";
import { v } from "convex/values";

import {
  consumeImplementation,
  getConsumptionImplementation,
} from "./consumption";
import { getFeaturesImplementation } from "./features";
import { InputConfiguration, normalizeConfiguration } from "./helpers";
import { getLimitsImplementation } from "./limits";
import { Persistence } from "./persistence";
import { KVStore } from "./persistence/kv";
import {
  buildWebhookImplementation,
  checkoutImplementation,
  createStripeCustomerImplementation,
  getPlansImplementation,
  getPortalImplementation,
  getSubscriptionImplementation,
  syncImplementation,
} from "./stripe";

export * from "./persistence";

export { billingTables } from "./tables";

export type { InputConfiguration, InternalConfiguration } from "./helpers";

export const internalConvexBilling = (configuration_: InputConfiguration) => {
  const configuration = normalizeConfiguration(configuration_);

  const store: Persistence = new KVStore(configuration);

  return {
    billing: {
      addHttpRoutes: (http: HttpRouter) => {
        http.route({
          path: "/stripe/webhook",
          method: "POST",
          handler: buildWebhookImplementation(configuration, store),
        });
      },
    },
    // --- --- --- stripe.ts
    getPortal: internalActionGeneric({
      args: {
        entityId: v.string(),
        returnUrl: v.optional(v.string()),
      },
      handler: (context, args) =>
        getPortalImplementation(args, store, context, configuration),
    }),
    checkout: internalActionGeneric({
      args: {
        entityId: v.string(),
        priceId: v.string(),
        successUrl: v.optional(v.string()),
        cancelUrl: v.optional(v.string()),
        returnUrl: v.optional(v.string()),
      },
      handler: (context, args) =>
        checkoutImplementation(args, store, context, configuration),
    }),
    createStripeCustomer: internalActionGeneric({
      args: {
        entityId: v.string(),
      },
      handler: (context, args) =>
        createStripeCustomerImplementation(args, store, context, configuration),
    }),
    sync: internalActionGeneric({
      args: {
        stripeCustomerId: v.string(),
      },
      handler: (context, args) =>
        syncImplementation(args, store, context, configuration),
    }),
    getSubscription: internalActionGeneric({
      args: {
        entityId: v.string(),
      },
      handler: (context, args) =>
        getSubscriptionImplementation(args, store, context, configuration),
    }),
    webhook: buildWebhookImplementation(configuration, store),
    getPlans: internalActionGeneric({
      args: {},
      handler: (context, args) =>
        getPlansImplementation(args, store, context, configuration),
    }),
    // --- --- --- usage.ts
    getConsumption: internalActionGeneric({
      args: {
        entityId: v.string(),
        name: v.string(),
      },
      handler: (context, args) =>
        getConsumptionImplementation(args, store, context, configuration),
    }),
    consume: internalActionGeneric({
      args: {
        entityId: v.string(),
        amount: v.number(),
        name: v.string(),
        enforce: v.optional(v.boolean()),
      },
      handler: (context, args) =>
        consumeImplementation(args, store, context, configuration),
    }),
    // --- --- --- limits.ts
    getLimits: internalActionGeneric({
      args: {
        priceId: v.string(),
      },
      handler: (context, args) =>
        getLimitsImplementation(args, store, context, configuration),
    }),
    // --- --- --- features.ts
    getFeatures: internalActionGeneric({
      args: {
        priceId: v.string(),
      },
      handler: (context, args) =>
        getFeaturesImplementation(args, store, context, configuration),
    }),
  };
};
