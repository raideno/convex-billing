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
import { ConvexStore } from "./persistence/convex";

export * from "./persistence";

export { billingTables } from "./tables";

export type { Configuration };

export const convexBilling = (configuration_: Configuration) => {
  const configuration = configuration_;

  let store: Persistence;

  if (configuration.redis) store = new KVStore(configuration);
  else store = new ConvexStore(configuration);

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
    portal: buildPortal(configuration, store),
    checkout: buildCheckout(configuration, store),
    createStripeCustomer: buildCreateStripeCustomer(configuration, store),
    sync: buildSync(configuration, store),
    subscription: buildSubscription(configuration, store),
    webhook: buildWebhook(configuration, store),
    plans: buildPlans(configuration, store),
    // --- --- --- usage.ts
    getUsage: buildGetUsage(configuration, store),
    consume: buildConsume(configuration, store),
    // --- --- --- limits.ts
    getLimits: buildGetLimits(configuration, store),
    // --- --- --- features.ts
    getFeatures: buildGetFeatures(configuration, store),
  };
};
