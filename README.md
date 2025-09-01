# Convex Stripe Billing

> [!WARNING]
> This library is still under development. Since it handles payments, please use it with caution.

Stripe subscriptions, limits and features for Convex apps.
Implemented according to the best practices listed in [Stripe Recommendations](https://github.com/t3dotgg/stripe-recommendations).

## Install

```bash
npm install @raideno/convex-billing stripe
```

## Configure

You'll need a Stripe account were products with recurring prices are configured.
You also need to setup webhooks with pointing towards `https://<your-convex-app>.convex.site/stripe/webhook`.
Enable the [following events](#stripe-events).

First setup the environment variables in your convex backend:
```bash
npx convex env set STRIPE_SECRET_KEY "<secret>"
npx convex env set STRIPE_WEBHOOK_SECRET "<secret>"
npx convex env set STRIPE_PUBLISHABLE_KEY "<secret>"
```

Add the required tables into your `convex/schema.ts` file.

```ts
// convex/billing.ts

import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";
import { billingTables } from "@raideno/convex-billing/server";

export default defineSchema({
  ...billingTables,
  // your other tables...,
});

```

Create `convex/billing.ts` file and initialize the module.

```ts
// convex/billing.ts

import { KVStore, ConvexStore } from "@raideno/convex-billing/server/persistence";
import { internalConvexBilling } from "@raideno/convex-billing/server";

export const {
  billing,
  store,
  // --- stripe
  getPortal,
  checkout,
  createStripeCustomer,
  sync,
  getSubscription,
  getPlans,
  // --- metadata
  getMetadata,
} = internalConvexBilling({
  persistence: new ConvexStore(),
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY!,
  },
  // https://<convex-project-id>.convex.site
  // https://<convex-project-id>.convex.cloud
  convex: { projectId: "chimpunk-6289" },
});
```

**NOTE:** All the exposed actions are internal. You can create wrappers to expose them as public actions if needed. The persistence layer serves to sync the subscription data from Stripe to the Convex database. Two persistence implementations are provided: `KVStore` using Upstash Redis and `ConvexStore` using your Convex database itself. You can also implement your own persistence layer by implementing the `Persistence` interface.

Register the HTTP routes (webhooks and callback url).

```ts
// convex/http.ts

import { httpRouter } from "convex/server";
import { billing } from "./billing";

const http = httpRouter();

// registers POST /stripe/webhook
// registers POST /stripe/return/*
billing.addHttpRoutes(http);

export default http;
```

Ideally you should create a stripe customer as soon as the user / organization or whatever entity you bill for is created. You can do this using the `createStripeCustomer` action. Below is an example for users using convex-auth:
```ts
// convex/convex.auth.ts

import { convexAuth } from "@convex-dev/auth/server";

import Google from "@auth/core/providers/google";

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

If you are billing organizations, you'll likely have a createOrganization action somewhere in your codebase. You can call `createStripeCustomer` there instead, passing the organization id as `entityId`.
```ts
// convex/organizations.ts

import { v } from "convex/values";
import { api, internal } from "./_generated/api";

import { getAuthUserId } from "@convex-dev/auth/server";

export const createOrganization = query({
  args: { name: v.string()},
  handler: async (context, args) => {
    const userId = await getAuthUserId(context);

    if (!userId)
      throw new Error("Not authorized.");

    const orgId = await context.db.insert("organizations", {
      name: args.name,
      ownerId: userId,
    });

    await context.scheduler.runAfter(
      0,
      internal.billing.createStripeCustomer,
      {
        entityId: orgId,
      }
    );

    return orgId;
  }
});
```

**NOTE:** You can use the plan's price metadata in order to store limits and features and retrieve them on your application using the getMetadata function.

## Stripe Events

- Recommended events (handled and synced):
  - checkout.session.completed
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - customer.subscription.paused
  - customer.subscription.resumed
  - customer.subscription.pending_update_applied
  - customer.subscription.pending_update_expired
  - customer.subscription.trial_will_end
  - invoice.paid
  - invoice.payment_failed
  - invoice.payment_action_required
  - invoice.upcoming
  - invoice.marked_uncollectible
  - invoice.payment_succeeded
  - payment_intent.succeeded
  - payment_intent.payment_failed
  - payment_intent.canceled

## Usage

Start a hosted checkout session.

```ts
import { internal } from "./_generated/api";

export const startCheckout = async (
  ctx: any,
  entityId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) => {
  const { url } = await ctx.runAction(internal.billing.checkout, {
    entityId,
    priceId,
    successUrl,
    cancelUrl,
  });
  return url; // redirect
};
```

Open the Stripe customer portal.

```ts
export const openPortal = async (ctx: any, entityId: string, returnUrl: string) => {
  const { url } = await ctx.runAction(internal.billing.getPortal, { entityId, returnUrl });
  return url;
};
```

Read the cached subscription snapshot.

```ts
export const readSubscription = async (ctx: any, entityId: string) => {
  const sub = await ctx.runAction(internal.billing.getSubscription, {
    entityId,
  });
  return sub; // { status: "none" } if not found
};
```

Discover plans (Stripe Prices with expanded Product).

```ts
export const listPlans = async (ctx: any) => {
  const plans = await ctx.runAction(internal.billing.getPlans, {});
  return plans;
};
```

## TODOs

- [ ] Implement default plan.
- [ ] Implement one time payment endpoint.
- [ ] Show an example app for subscription and one time payments with credits usage.

## Contributions

All contributions are welcome! Please open an issue or a PR.
