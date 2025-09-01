import { internalConvexBilling } from "@raideno/convex-billing/src/server";

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
  getPlans: getPlans_, // *
  getMetadata,
} = internalConvexBilling(configuration);
