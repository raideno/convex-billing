# Convex Stripe Billing

Stripe subscriptions, usage limits, and consumption for Convex apps.

## Install

```bash
npm install @raideno/convex-billing stripe convex
```

## Configure

Create `billing.ts` and initialize the module.

```ts
// billing.ts
import { KVStore } from "@raideno/convex-billing/server/persistence";
import { internalConvexBilling } from "@raideno/convex-billing/server";

export const {
  billing,
  // --- stripe
  getPortal,
  checkout,
  createStripeCustomer,
  sync,
  getSubscription,
  webhook,
  getPlans,
  // --- usage
  getConsumption,
  consume,
  // --- metadata
  getLimits,
  getFeatures,
} = internalConvexBilling({
  redis: KVStore({
    url: process.env.UPSTASH_URL!,
    token: process.env.UPSTASH_WRITE_TOKEN!,
  }),
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY!,
  },
  defaults: {
    portal_return_url: "http://localhost:3000/return-from-portal",
    checkout_success_url: "http://localhost:3000/return-from-success",
    checkout_cancel_url: "http://localhost:3000/return-from-canceled",
    checkout_return_url: "http://localhost:3000/return-from-payment",
    // NOTE: required only if using the getLimits action
    limits: {
      "limits:standard-credits": 1000,
      "limits:premium-credits": 100,
    },
  },
});
```

Register the webhook HTTP route.

```ts
// http.ts
import { httpRouter } from "convex/server";
import { billing } from "./billing";

const http = httpRouter();

billing.addHttpRoutes(http); // registers POST /stripe/webhook

export default http;
```

## Stripe setup

- Create Products and Prices.
- On each Price, add metadata:
  - limits: use the `limits:` prefix, e.g., `limits:standard-credits = 1000`
  - features: use the `features:` prefix, e.g., `features:24/7 Support = 1`
- Configure a webhook endpoint to your Convex URL at `/stripe/webhook`.
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

## Create a Stripe customer early

Create the Stripe Customer when you create a user or organization. If it exists,
the action is a no-op.

```ts
import { internal } from "./_generated/api";

export const afterUserCreated = async (ctx: any, userId: string) => {
  await ctx.scheduler.runAfter(0, internal.billing.createStripeCustomer, {
    entityId: userId,
  });
};
```

For organizations, pass the org id as `entityId`. All members share the same
subscription and usage counters.

## Usage

Start a hosted checkout session.

```ts
import { internal } from "./_generated/api";

export const startCheckout = async (
  ctx: any,
  entityId: string,
  priceId: string
) => {
  const { url } = await ctx.runAction(internal.billing.checkout, {
    entityId,
    priceId,
  });
  return url; // redirect
};
```

Open the Stripe customer portal.

```ts
export const openPortal = async (ctx: any, entityId: string) => {
  const { url } = await ctx.runAction(internal.billing.getPortal, { entityId });
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

Consume credits with optional enforcement against plan limits.

```ts
export const consume = async (
  ctx: any,
  entityId: string,
  amount: number
) => {
  const ok = await ctx.runAction(internal.billing.consume, {
    entityId,
    name: "limits:standard-credits",
    amount,
    enforce: true,
  });
  if (!ok) throw new Error("limit_reached");
};
```

Read usage, limit, and remaining for a counter.

```ts
export const getUsage = async (ctx: any, entityId: string) => {
  const res = await ctx.runAction(internal.billing.getConsumption, {
    entityId,
    name: "limits:standard-credits",
  });
  // res = { usage, limit, remaining }
  return res;
};
```

Discover plans (Stripe Prices with expanded Product).

```ts
export const listPlans = async (ctx: any) => {
  const plans = await ctx.runAction(internal.billing.getPlans, {});
  return plans;
};
```

Read limits or features for a Price id from metadata.

```ts
export const readLimits = async (ctx: any, priceId: string) => {
  return await ctx.runAction(internal.billing.getLimits, { priceId });
};

export const readFeatures = async (ctx: any, priceId: string) => {
  return await ctx.runAction(internal.billing.getFeatures, { priceId });
};
```

## Storage

Upstash Redis is used to cache subscription state and track usage.

Keys:
- subscription:customer:{stripeCustomerId} -> subscription snapshot
- stripe:entity:{entityId} -> stripeCustomerId
- usage:customer:{stripeCustomerId}:{period.start}:{period.end}:{name} -> number

Usage keys have a TTL set to expire at the billing period end.

## TODOs

- [ ] Add documentation part to setup syncing call on checkout return endpoint.
- [ ] Implement default plan.
- [ ] Implement one time payment endpoint.

## Notes

- One active subscription per entity is assumed.
- `getOrSetupUsage` and `incrementUsageBy` are not atomic. Prefer
  `incrementUsageByAndSetupIfNotAlready` (used by `consume`) for atomic checks.
- Limits and features are extracted from Price metadata using the configured
  prefixes. Missing keys fall back to defaults.

## License

Apache-2.0