# Convex Stripe

A demo project is available at [https://convex-stripe-demo.vercel.app/](https://convex-stripe-demo.vercel.app/).

Stripe [syncing](./references/tables.md), subscriptions and [checkouts](#-checkout-action) for Convex apps. Implemented according to the best practices listed in [Theo's Stripe Recommendations](https://github.com/t3dotgg/stripe-recommendations).


## Installation

::: code-group

```sh [npm]
npm install @raideno/convex-stripe stripe
```

```sh [pnpm]
pnpm add @raideno/convex-stripe stripe
```

```sh [yarn]
yarn add @raideno/convex-stripe stripe
```

```sh [bun]
bun add @raideno/convex-stripe stripe
```

:::


## Configuration

### 1. Set up Stripe  
- Create a Stripe account.  
- Configure a webhook pointing to:  
  ```
  https://<your-convex-app>.convex.site/stripe/webhook
  ```
- Enable the following [Stripe Events](./references/events.md).  
- Enable the Stripe Billing Portal.

### 2. Set ENV

```bash
npx convex env set STRIPE_SECRET_KEY "<secret>"
npx convex env set STRIPE_WEBHOOK_SECRET "<secret>"
```

### 3. Add tables.

Check [Tables Schemas](./references/tables.md) to know more about the synced tables.

```ts [convex/schema.ts]
import { defineSchema } from "convex/server";
import { stripeTables } from "@raideno/convex-stripe/server";

export default defineSchema({
  ...stripeTables,
  // your other tables...
});
```

### 4. Initialize the library

```ts [convex/stripe.ts]
import { internalConvexStripe } from "@raideno/convex-stripe/server";

export const { stripe, store, sync, setup } = internalConvexStripe({
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
});
```

> **Note:** All exposed actions (store, sync, setup) are **internal**. Meaning they can only be called from other convex functions, you can wrap them in public actions when needed.  
> **Important:** `store` must always be exported, as it is used internally.

### 5. Register HTTP routes

```ts [convex/http.ts]
import { httpRouter } from "convex/server";
import { stripe } from "./stripe";

const http = httpRouter();

// registers POST /stripe/webhook
// registers GET /stripe/return/*
stripe.addHttpRoutes(http);

export default http;
```

### 6. Stripe customers

Ideally you want to create a stripe customer the moment a new entity (user, organization, etc) is created.

An `entityId` refers to something you are billing. It can be a user, organization or any other thing. With each entity must be associated a stripe customer and the stripe customer can be created using the [`setup` action](#setup-action).

Below are with different auth providers examples where the user is the entity we are billing.

::: code-group

```ts [convex-auth]
"convex/auth.ts"

// example with convex-auth: https://labs.convex.dev/auth

import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { internal } from "./_generated/api";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    afterUserCreatedOrUpdated: async (context, args) => {
      await context.scheduler.runAfter(0, internal.stripe.setup, {
        entityId: args.userId,
        email: args.profile.email,
      });
    },
  },
});
```

```ts [better-auth]
"convex/auth.ts"

// example with better-auth: https://convex-better-auth.netlify.app/

// coming soon...
```

```ts [clerk]
"convex/auth.ts"

// example with clerk: https://docs.convex.dev/auth/clerk

// coming soon...
```

:::

### 7. Run `sync` action

In your convex project's dashboard. Go the **Functions** section and execute the `sync` action.

This is done to sync already existing stripe data into your convex database.
It must be done in both your development and production deployments.

This might not be necessary if you are starting with a fresh empty stripe project.

### 8. Start building 
Now you can use the different provided functions to:
- Generate a subscription or payment link [`stripe.subscribe`](#subscribe-function), [`stripe.pay`](#pay-function) for a given entity.
- Generate a link to the entity's [`stripe.portal`](#portal-function) to manage their subscriptions.
- Consult the different synced tables.
- Etc.

## Usage

The library automatically syncs the [following tables](./references/tables.md).

You can query these tables at any time to:

- List available products/plans and prices.
- Retrieve customers and their `customerId`.
- Check active subscriptions.
- Etc.

### `setup` Action

Creates or updates a Stripe customer for a given entity (user or organization).

This should be called whenever a new entity is created in your app, or when you want to ensure the entity has a Stripe customer associated with it.

```ts
import { v } from "convex/values";
import { action, internal } from "./_generated/api";

export const setupCustomer = action({
  args: { entityId: v.string(), email: v.optional(v.string()) },
  handler: async (context, args) => {
    // Add your own auth/authorization logic here
    const response = await context.runAction(internal.stripe.setup, {
      entityId: args.entityId,
      email: args.email, // optional, but recommended for Stripe
      metadata: {
        // NOTE: entityId is a reserved key and can't be used
        foo: "bar",
      }
    });

    return response.customerId;
  },
});
```

**Notes:**

- `entityId` is your app’s internal ID (user/org).
- `customerId` is stripe's internal ID.
- `email` is optional, but recommended so the Stripe customer has a contact email.
- If the entity already has a Stripe customer, setup will return the existing one instead of creating a duplicate.
- Typically, you’ll call this automatically in your user/org creation flow (see [Configuration - 6](#configuration)).

### `sync` Action

Sync all existing data on stripe to convex database.

### `subscribe` Function

Creates a Stripe Subscription Checkout session for a given entity.

```ts
import { v } from "convex/values";

import { stripe } from "./stripe";
import { action, internal } from "./_generated/api";

export const createCheckout = action({
  args: { entityId: v.string(), priceId: v.string() },
  handler: async (context, args) => {
    // Add your own auth/authorization logic here

    const response = await stripe.subscribe(context, {
      entityId: args.entityId,
      priceId: args.priceId,
      successUrl: "http://localhost:3000/payments/success",
      cancelUrl: "http://localhost:3000/payments/cancel",
      // NOTE: true by default. if set to false will throw an error if provided entityId don't have a customerId associated to it.
      // createStripeCustomerIfMissing: true
    });

    return response.url;
  },
});
```


### `portal` Function

Allows an entity to manage their subscription via the Stripe Portal.

```ts
import { v } from "convex/values";

import { stripe } from "./stripe";
import { action, internal } from "./_generated/api";

export const portal = action({
  args: { entityId: v.string() },
  handler: async (context, args) => {
    const response = await stripe.portal(context, {
      entityId: args.entityId,
      returnUrl: "http://localhost:3000/return-from-portal",
    });

    return response.url;
  },
});
```
The provided entityId must have a customerId associated to it otherwise the action will throw an error.

### `pay` Function

Creates a Stripe One Time Payment Checkout session for a given entity.

```ts
import { v } from "convex/values";

import { stripe } from "./stripe";
import { action, internal } from "./_generated/api";

export const subscribe = action({
  args: { entityId: v.string(), priceId: v.string() },
  handler: async (context, args) => {
    // Add your own auth/authorization logic here

    const response = await stripe.pay(context, {
      // TODO: complete
    });

    return response.url;
  },
});
```

## Best Practices

- Always create a Stripe customer (`setup`) when a new entity is created.  
- Use `metadata` or `marketing_features` on products to store feature flags or limits.  
- Run `sync` when you first configure the extension to sync already existing stripe resources.  
- Never expose internal actions directly to clients, wrap them in public actions with proper authorization.

## Resources

- [Convex Documentation](https://docs.convex.dev)  
- [Stripe Documentation](https://stripe.com/docs)  
- [Demo App](https://convex-stripe-demo.vercel.app/)  
- [GitHub Repository](https://github.com/raideno/convex-stripe)
- [Theo's Stripe Recommendations](https://github.com/t3dotgg/stripe-recommendations)
