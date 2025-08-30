---
outline: deep
---

# Organization Based Billing

This guide shows how to bill at the organization level. Use the organization id
as `entityId`. All members share the same subscription and usage counters.

## Create a Stripe Customer when an organization is created

When you create an organization, also create the Stripe customer tied to that
organization id.

```ts
import { internal } from "./_generated/api";

export const createOrganization = async (ctx: any, orgId: string) => {
  // persist your organization...

  await ctx.scheduler.runAfter(0, internal.billing.createStripeCustomer, {
    entityId: orgId,
  });
};
```

## Checkout and portal

Use the organization id for all calls.

```ts
import { internal } from "./_generated/api";

export const startOrgCheckout = async (
  ctx: any,
  orgId: string,
  priceId: string
) => {
  const { url } = await ctx.runAction(internal.billing.checkout, {
    entityId: orgId,
    priceId,
  });
  return url;
};

export const openOrgPortal = async (ctx: any, orgId: string) => {
  const { url } = await ctx.runAction(internal.billing.getPortal, {
    entityId: orgId,
  });
  return url;
};
```

## Guard usage by membership

Before consuming org credits, check that the caller is a member of the org and
authorized to perform the action.

```ts
import { internal } from "./_generated/api";

export const consumeOrgCredits = async (
  ctx: any,
  orgId: string,
  userId: string,
  amount: number
) => {
  // your own membership/role checks here...

  const ok = await ctx.runAction(internal.billing.consume, {
    entityId: orgId,
    name: "limits:standard-credits",
    amount,
    enforce: true,
  });

  if (!ok) throw new Error("limit_reached");
};
```

## Show usage in org dashboards

```ts
import { internal } from "./_generated/api";

export const getOrgUsage = async (ctx: any, orgId: string) => {
  return await ctx.runAction(internal.billing.getConsumption, {
    entityId: orgId,
    name: "limits:standard-credits",
  });
};
```

## Stripe metadata

Same rules as user billing. Keep limits and features on the Stripe Price using
the same prefixes and key names.
