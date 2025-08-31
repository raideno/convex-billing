---
outline: deep
---

# Organization Based Billing

This guide shows how to bill at the organization level. Use the organization id
as `entityId`. All members share the same subscription.

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
  priceId: string,
  successUrl: string,
  cancelUrl: string
) => {
  const { url } = await ctx.runAction(internal.billing.checkout, {
    entityId: orgId,
    priceId,
    successUrl,
    cancelUrl,
  });
  return url;
};

export const openOrgPortal = async (ctx: any, orgId: string, returnUrl: string) => {
  const { url } = await ctx.runAction(internal.billing.getPortal, {
    entityId: orgId,
    returnUrl
  });
  return url;
};
```

## Stripe metadata

Same rules as user billing. Keep limits and features on the Stripe Price using
the same prefixes and key names.
