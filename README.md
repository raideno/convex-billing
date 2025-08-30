**TODO:** Make it so even if the stripe customer isn't created at user creation, it gets created at first billing related action or when sync is performed.

**NOTE:** Use vitepress for the documentation site.

# Convex Stripe Billing Helpers

First install the package using your favorite package manager:
```bash
npm install @raideno/convex-billing
```

Create a `billing.ts` to configure the billing library:
```ts
import { convexBilling } from "@raideno/convex-billing/server";

export const {
    billing,
    ...
} = convexBilling({
    ...
});
```

In `http.ts` register the stripe webhook endpoint:
```ts
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
