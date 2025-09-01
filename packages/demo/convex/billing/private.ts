import {
  internalConvexBilling,
  STRIPE_SUB_CACHE,
} from "@raideno/convex-billing/server";

import configuration from "./billing.config";

export const {
  billing,
  store,
  // --- stripe
  getPortal: getPortal_, // *
  checkout: checkout_, // *
  createStripeCustomer,
  sync,
  getSubscription: getSubscription_, // *
  webhook,
} = internalConvexBilling(configuration);

export type { STRIPE_SUB_CACHE };
