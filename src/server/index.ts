// index.ts

import { HttpRouter, PublicHttpAction } from "convex/server";

import {
  buildCheckout,
  buildCreateStripeCustomer,
  buildPlans,
  buildPortal,
  buildSubscription,
  buildSync,
  buildWebhook,
} from "./stripe";

import { Configuration } from "./helpers";
import { buildGet as buildGetLimits } from "./limits";
import { buildGet as buildGetFeatures } from "./features";
import { buildConsume, buildGet as buildGetUsage } from "./usage";
import { KVStore } from "./persistence/kv";
import { Persistence } from "./persistence";

export * from "./persistence";

export { billingTables } from "./tables";

export type { Configuration };

export const convexBilling = (configuration_: Configuration) => {
  const configuration = configuration_;

  let store: Persistence = new KVStore(configuration);

  return {
    billing: {
      addHttpRoutes: (http: HttpRouter) => {
        // https://modest-chipmunk-615.convex.cloud
        // https://modest-chipmunk-615.convex.site/stripe/webhook
        http.route({
          path: "/stripe/webhook",
          method: "POST",
          handler: buildWebhook(configuration, store) as PublicHttpAction,
        });
      },
    },
    // --- --- --- stripe.ts
    getPortal: buildPortal(configuration, store),
    checkout: buildCheckout(configuration, store),
    createStripeCustomer: buildCreateStripeCustomer(configuration, store),
    sync: buildSync(configuration, store),
    getSubscription: buildSubscription(configuration, store),
    webhook: buildWebhook(configuration, store),
    getPlans: buildPlans(configuration, store),
    // --- --- --- usage.ts
    getUsage: buildGetUsage(configuration, store),
    getConsumption: buildConsume(configuration, store),
    // --- --- --- limits.ts
    getLimits: buildGetLimits(configuration, store),
    // --- --- --- features.ts
    getFeatures: buildGetFeatures(configuration, store),
  };
};
