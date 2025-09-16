import { InputConfiguration } from "@raideno/convex-stripe/server";

export default {
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
  },

  convex: { projectId: "amicable-marmot-910" },

  store: "stripe:store",
  debug: true,
} as InputConfiguration;
