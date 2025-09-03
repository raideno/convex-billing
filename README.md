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

import { internalConvexBilling } from "@raideno/convex-billing/server";

export const {
  billing,
  store,
  // --- stripe
  portal,
  checkout,
  setup,
} = internalConvexBilling({
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  // https://<convex-project-id>.convex.site
  // https://<convex-project-id>.convex.cloud
  convex: { projectId: "chimpunk-6289" },
});
```

**NOTE:** All the exposed actions are internal. You can create wrappers to expose them as public actions if needed.

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

Ideally you should create a stripe customer as soon as the user / organization or whatever entity you bill for is created. You can do this using the `setup` action. Below is an example for users using convex-auth:
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
        internal.billing.setup,
        {
          entityId: userId,
        }
      );
    },
  },
});
```

If you are billing organizations, you'll likely have a createOrganization action somewhere in your codebase. You can call `setup` there instead, passing the organization id as `entityId`.
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
      internal.billing.setup,
      {
        entityId: orgId,
      }
    );

    return orgId;
  }
});
```

**NOTE:** You can use the plan's price metadata in order to store limits and features and retrieve them on your application from the synced tables.

## Stripe Events

Recommended events (handled and synced):

For subscriptions syncing:
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

For products syncing:
- product.created
- product.updated
- product.deleted

For prices syncing:
- price.created
- price.updated
- price.deleted

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
  const { url } = await ctx.runAction(internal.billing.portal, { entityId, returnUrl });
  return url;
};
```

## TODOs

- [ ] A function that takes a stripe subscription object and returns a simpler representation just like theo's one.
- [ ] Implement default plan.
- [ ] Implement one time payment endpoint.
- [ ] Show an example app for subscription and one time payments with credits usage.

## Development

Clone the repository:

```bash
git clone git@github.com:raideno/convex-billing.git
cd convex-billing
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
# automatically rebuild lib on changes
npm run dev --workspace @raideno/convex-billing
# run the demo app
npm run dev --workspace demo
```

## Contributions

All contributions are welcome! Please open an issue or a PR.
