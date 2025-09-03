import { InputConfiguration } from "@raideno/convex-billing/server";

export default {
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY!,
  },

  convex: { projectId: process.env.CONVEX_PROJECT_ID! },

  store: "billing/private:store",
  debug: true,
} as InputConfiguration;
