import { InputConfiguration } from "@raideno/convex-billing/src/server";
import { KVStore } from "@raideno/convex-billing/src/server/persistence";

export default {
  persistence: new KVStore({
    url: process.env.UPSTASH_URL!,
    token: process.env.UPSTASH_WRITE_TOKEN!,
  }),

  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY!,
  },

  defaults: {
    limits: {
      "limits:standard-credits": 1000,
      "limits:premium-credits": 100,
    },
    portal_return_url: "http://localhost:3000/return-from-portal",
    checkout_success_url: "http://localhost:3000/return-from-success",
    checkout_cancel_url: "http://localhost:3000/return-from-canceled",
    checkout_return_url: "http://localhost:3000/return-from-payment",
  },
} as InputConfiguration;
