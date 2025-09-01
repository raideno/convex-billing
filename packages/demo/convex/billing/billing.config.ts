import { InputConfiguration } from "@raideno/convex-billing/server";
import { ConvexStore } from "@raideno/convex-billing/server/persistence";

export default {
  persistence: new ConvexStore("billing/private:store"),

  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY!,
  },

  convex: { projectId: process.env.CONVEX_PROJECT_ID! },
} as InputConfiguration;
