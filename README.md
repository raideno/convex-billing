# Convex Stripe Billing

First install the package using your favorite package manager:
```bash
npm install @raideno/convex-billing
```

Create a `billing.ts` to configure the billing library:
```ts
// billing.ts

import { convexBilling } from "@raideno/convex-billing/server";

export const {
    billing,
    // --- --- --- stripe
    portal,
    checkout,
    createStripeCustomer,
    sync,
    subscription,
    webhook,
    plans,
    // --- --- --- usage
    getUsage,
    consume,
    // --- --- --- limits
    getLimits,
    // --- --- --- features
    getFeatures,
} = convexBilling({
  // TODO: all secrets below must be set on convex using `npx convex env set <secret-name> "<secret-value>"`
  redis: {
    url: process.env.UPSTASH_URL!,
    write_token: process.env.UPSTASH_WRITE_TOKEN!,
    read_token: process.env.UPSTASH_READ_TOKEN!,
  },

  stripe_secret_key: process.env.STRIPE_SECRET_KEY!,
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
  stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY!,

  credits_initial_usage_value: 0,

  metadata_limits_key_prefix: "limits:",
  metadata_features_key_prefix: "features:",

  default_limits: {
    "limits:standard-credits": 5,
    "limits:premium-credits": 5,
  },

  default_features: {
    "features:24/7 Support": null,
    "features:Standard Credits": 5,
    "features:Premium Credits": 5,
  },

  default_portal_return_url: "http://localhost:3000/return-from-portal",

  default_checkout_success_url: "http://localhost:3000/return-from-successeful",
  default_checkout_cancel_url: "http://localhost:3000/return-from-canceled",
  default_checkout_return_url: "http://localhost:3000/return-from-payment",

  default_price_id: "...",
});
```

In `http.ts` register the stripe webhook endpoint:
```ts
// http.ts

import { httpRouter } from "convex/server";

import { billing } from "./billing.ts";

const http = httpRouter();

// ...

billing.addHttpRoutes(http);

// ...

export default http;
```

In your stripe dashboard, configure the webhook to point to `https://your-domain.com/webhook` and listen to the following events:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Now create stripe products and prices in your stripe dashboard, use `limits:` and `features:` in your stripe metadata to configure the subscription plans limits and features.

It is also important to setup a hook after a user is created so a stripe customer is created for the user.
The system would work without this step but it is preferable to have a stripe customer created as soon as the user is created.

```ts
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

import { internal } from "./_generated/api";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    afterUserCreatedOrUpdated: async (context, args) => {
      const userId = args.userId;

      await context.scheduler.runAfter(
        0,
        internal.billing.createStripeCustomer,
        {
          entityId: userId,
        }
      );
    },
  },
});
```

If not using redis, do not forget to integrate to integrate the tables:
```ts
...
```

# Billing

The implementation of billing and subscription management uses stripe and a kv-store to cache subscription status.
It follows the pattern and best practices described in [Theo's T3 Gg Github Repository](https://github.com/t3dotgg/stripe-recommendations).

# Todos

- [ ] Make it so even if the stripe customer isn't created at user creation, it gets created at first billing related action or when sync is performed.