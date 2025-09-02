import { internalConvexBilling } from "@raideno/convex-billing/server";

import configuration from "./billing.config";

export const {
  billing,
  store,
  // --- stripe
  portal: getPortal_, // *
  checkout: checkout_, // *
  createStripeCustomer,
} = internalConvexBilling(configuration);
