---
outline: deep
---

# User Based Billing

This guide shows how to run billing for individual users. Use each user's id as
`entityId`.

## Prerequisites

- You installed the package and configured `internalConvexBilling(...)` with
  Stripe and KV credentials.
- Your Stripe Price metadata defines limits and features (see below).

## Create a Stripe Customer when a user is created

Create the Stripe customer as soon as you have a user id. You can do it in an
auth callback, a mutation, or a background job.

```ts
import { internal } from "./_generated/api";

// Example: run after a user is created
await ctx.scheduler.runAfter(0, internal.billing.createStripeCustomer, {
  entityId: userId,
});
```

If the customer already exists for that user, this is a no-op.

## Start a checkout session

Create a hosted checkout session for a specific Stripe Price id.

```ts
import { internal } from "./_generated/api";

export const startCheckout = async (ctx: any, userId: string, priceId: string) => {
  const { url } = await ctx.runAction(internal.billing.checkout, {
    entityId: userId,
    priceId,
    // optionally override success/cancel/return URLs configured in billing
  });

  return url; // redirect the browser to this URL
};
```

## Open the customer portal

```ts
import { internal } from "./_generated/api";

export const openPortal = async (ctx: any, userId: string) => {
  const { url } = await ctx.runAction(internal.billing.getPortal, {
    entityId: userId,
  });
  return url;
};
```

## Read subscription state

Use the cached value to render paywalls and usage UI.

```ts
import { internal } from "./_generated/api";

export const getSubscription = async (ctx: any, userId: string) => {
  const sub = await ctx.runAction(internal.billing.getSubscription, {
    entityId: userId,
  });

  // sub.status === "none" if no active subscription in cache
  return sub;
};
```

If you need a fresh sync from Stripe, call `internal.billing.sync` with the
Stripe customer id, then read `getSubscription` again.

## Stripe metadata

On the Stripe Price object, set:

- `limits:standard-credits`: number (e.g., 1000)
- `features:Standard Credits`: number (if you want to expose this in a plan
  card)

You can define multiple counters and features. Defaults are filled from your
configuration if missing.
