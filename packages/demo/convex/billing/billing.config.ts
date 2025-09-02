import { InputConfiguration } from "@raideno/convex-billing/server";

import { internal } from "../_generated/api";

export default {
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY!,
  },

  convex: { projectId: process.env.CONVEX_PROJECT_ID! },

  store: "billing/private:store",
  // store: internal.billing.private.store,
} as InputConfiguration;
