# Convex Stripe Billing

| Status      | Features                                                                       |
| ----------- | ------------------------------------------------------------------------------ |
| ✅ Supported | Subscriptions, Checkout, Billing portal, Sync webhooks and cron, Multi-tenant. |
| 🚧 Planned   | One‑time payments, Usage based billing, Credits.                               |

A demo project is available at [https://convex-billing-demo.vercel.app/](https://convex-billing-demo.vercel.app/).

Stripe [syncing](#📑-table-schemas), subscriptions and [checkouts](#-checkout-action) for Convex apps. Implemented according to the best practices listed in [Theo's Stripe Recommendations](https://github.com/t3dotgg/stripe-recommendations).


## 🚀 Installation

::: code-group

```sh [npm]
npm add @raideno/convex-billing stripe
```

```sh [pnpm]
pnpm add @raideno/convex-billing stripe
```

```sh [yarn]
yarn add @raideno/convex-billing stripe
```

```sh [bun]
bun add @raideno/convex-billing stripe
```

:::


## ⚙️ Configuration

1. **Set up Stripe**  
   - Create a Stripe account.  
   - Configure a webhook pointing to:  
     ```
     https://<your-convex-app>.convex.site/stripe/webhook
     ```
   - Enable the [📡 Stripe Events](#📡-stripe-events).  
   - Enable the Stripe Billing Portal.

2. **Set environment variables** in your Convex backend:

```bash
npx convex env set STRIPE_SECRET_KEY "<secret>"
npx convex env set STRIPE_WEBHOOK_SECRET "<secret>"
```

3. **Add billing tables** to your schema:

Check [📑 Tables Schema](#📑-table-schemas) to know more about synced tables.

```ts [convex/schema.ts]
import { defineSchema } from "convex/server";
import { billingTables } from "@raideno/convex-billing/server";

export default defineSchema({
  ...billingTables,
  // your other tables...
});
```

4. **Initialize billing** in `convex/billing.ts`:

```ts [convex/billing.ts]
import { internalConvexBilling } from "@raideno/convex-billing/server";

export const {
  // mandatory
  billing,
  store,
  sync,
  // --- --- ---
  portal,
  checkout,
  setup,
} = internalConvexBilling({
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
});
```

> **Note:** All exposed actions are **internal**. Meaning they can only be called from other convex functions, you can wrap them in public actions when needed.  
> **Important:** `billing`, `store`, and `sync` must always be exported, as they are used internally.

1. **Register HTTP routes** in `convex/http.ts`:

```ts [convex/http.ts]
import { httpRouter } from "convex/server";
import { billing } from "./billing";

const http = httpRouter();

// registers POST /stripe/webhook
// registers GET /stripe/return/*
billing.addHttpRoutes(http);

export default http;
```

6. **Set up cron jobs** to keep data in sync:

```ts [convex/crons.ts]
import { cronJobs } from "convex/server";
import { billing } from "./billing";

const crons = cronJobs();

billing.addCronJobs(crons);

export default crons;
```

> **Note:** This is used as a way to sync data at startup and ensures data stays up to date, even if the server restarts or changes happen while it’s offline.
> You can skip this if you prefer to run the sync action manually at startup.

7. **Create Stripe customers** when entities (users/orgs) are created.  
   Example with [convex-auth](https://labs.convex.dev/auth):

```ts [convex/auth.ts]
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { internal } from "./_generated/api";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    afterUserCreatedOrUpdated: async (context, args) => {
      await context.scheduler.runAfter(0, internal.billing.setup, {
        entityId: args.userId,
        email: args.profile.email,
      });
    },
  },
});
```


## 🏢 Organization-Based Billing

If you bill organizations instead of users, call `setup` when creating an organization:

```ts [convex/organizations.ts]
import { v } from "convex/values";
import { query } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const createOrganization = query({
  args: { name: v.string() },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context);
    if (!userId) throw new Error("Not authorized.");

    const orgId = await context.db.insert("organizations", {
      name: args.name,
      ownerId: userId,
    });

    await context.scheduler.runAfter(0, internal.billing.setup, {
      entityId: orgId,
    });

    return orgId;
  },
});
```


## 📦 Usage

The library automatically syncs:

<!-- no toc -->
- [`convex_billing_products`](#convex-billing-products)
- [`convex_billing_prices`](#convex-billing-prices)
- [`convex_billing_customers`](#convex-billing-customers)
- [`convex_billing_subscriptions`](#convex-billing-subscriptions)

You can query these tables at any time to:

- List available products/plans and prices
- Retrieve customers and their `stripeCustomerId`
- Check active subscriptions

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
    const response = await context.runAction(internal.billing.setup, {
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

**📌 Notes:**

- `entityId` is your app’s internal ID (user/org).
- `customerId` is stripe's internal ID.
- `email` is optional, but recommended so the Stripe customer has a contact email.
- If the entity already has a Stripe customer, setup will return the existing one instead of creating a duplicate.
- Typically, you’ll call this automatically in your user/org creation flow (see [⚙️ Configuration - 7](#️⚙️-configuration)).

### `checkout` Action

Creates a Stripe Checkout session for a given entity.

```ts
import { v } from "convex/values";
import { action, internal } from "./_generated/api";

export const createCheckout = action({
  args: { entityId: v.string(), priceId: v.string() },
  handler: async (context, args) => {
    // Add your own auth/authorization logic here
    const response = await context.runAction(internal.billing.checkout, {
      entityId: args.entityId,
      priceId: args.priceId,
      successUrl: "http://localhost:3000/payments/success",
      cancelUrl: "http://localhost:3000/payments/cancel",
      // NOTE: true by default. if set to false will throw an error if provided entityId don't have a stripeCustomerId associated to it.
      // createStripeCustomerIfMissing: true
    });

    return response.url;
  },
});
```


### `portal` Action

Allows an entity to manage their subscription via the Stripe Portal.

```ts
import { v } from "convex/values";
import { action, internal } from "./_generated/api";

export const portal = action({
  args: { entityId: v.string() },
  handler: async (context, args) => {
    const response = await context.runAction(internal.billing.portal, {
      entityId: args.entityId,
      returnUrl: "http://localhost:3000/return-from-portal",
    });

    return response.url;
  },
});
```
The provided entityId must have a stripeCustomerId associated to it otherwise the action will throw an error.

## 📡 Stripe Events

The following events are handled and synced automatically:

**Subscriptions (<u>Mandatory</u>):**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.paused`
- `customer.subscription.resumed`
- `customer.subscription.pending_update_applied`
- `customer.subscription.pending_update_expired`
- `customer.subscription.trial_will_end`
- `customer.created`
- `customer.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `invoice.payment_action_required`
- `invoice.upcoming`
- `invoice.marked_uncollectible`
- `invoice.payment_succeeded`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`

**Products:**
- `product.created`
- `product.updated`
- `product.deleted`

**Prices:**
- `price.created`
- `price.updated`
- `price.deleted`

**Coupons**
- `coupon.created`
- `coupon.updated`
- `coupon.deleted`

**Promotion Codes**
- `promotion_code.created`
- `promotion_code.updated`


## ✅ Best Practices

- Always create a Stripe customer (`setup`) when a new entity is created.  
- Use `metadata` or `marketing_features` on products to store feature flags or limits.  
- Run `sync` periodically (via cron) to ensure data consistency.  
- Never expose internal actions directly to clients, wrap them in public actions with proper authorization.


## 📚 Resources

- [Convex Documentation](https://docs.convex.dev)  
- [Stripe Documentation](https://stripe.com/docs)  
- [Demo App](https://convex-billing-demo.vercel.app/)  
- [GitHub Repository](https://github.com/raideno/convex-billing)
- [Theo's Stripe Recommendations](https://github.com/t3dotgg/stripe-recommendations)

## 📑 Table Schemas

When you spread `billingTables` into your Convex schema, the following tables are created automatically:

### `convex_billing_products`
Stores Stripe products.

| Field            | Type             | Description                  |
| ---------------- | ---------------- | ---------------------------- |
| `_id`            | `string`         | Convex document ID           |
| `productId`      | `string`         | Stripe product ID            |
| `stripe`         | `Stripe.Product` | Synced stripe product data   |
| `last_synced_at` | `number`         | Last sync timestamp (Convex) |

Indexes:
- `byActive`
- `byName`

### `convex_billing_prices`
Stores Stripe prices.

| Field            | Type           | Description              |
| ---------------- | -------------- | ------------------------ |
| `_id`            | `string`       | Convex document ID       |
| `priceId`        | `string`       | Stripe price ID          |
| `stripe`         | `Stripe.Price` | Synced stripe price data |
| `last_synced_at` | `number`       | Last sync timestamp      |

Indexes:
- `byProductId`
- `byActive`
- `byRecurringInterval`
- `byCurrency`

### `convex_billing_customers`
Stores mapping between your app’s entities (users/orgs) and Stripe customers.

| Field            | Type              | Description                     |
| ---------------- | ----------------- | ------------------------------- |
| `_id`            | `string`          | Convex document ID              |
| `entityId`       | `string`          | Your app’s entity ID (user/org) |
| `customerId`     | `string`          | Stripe customer ID              |
| `stripe`         | `Stripe.Customer` | Synced stripe data              |
| `last_synced_at` | `number`          | Last sync timestamp             |

Indexes:
- `byEntityId`
- `byCustomerId`


### `convex_billing_subscriptions`
Stores Stripe subscriptions.

| Field            | Type                          | Description                                                      |
| ---------------- | ----------------------------- | ---------------------------------------------------------------- |
| `_id`            | `string`                      | Convex document ID                                               |
| `customerId`     | `string`                      | Stripe customer ID                                               |
| `subscriptionId` | `string \| null`              | Subscription Id or null if none exist.                           |
| `stripe`         | `Stripe.Subscription \| null` | Full Stripe subscription object `Stripe.Subscription`(or `null`) |
| `last_synced_at` | `number`                      | Last sync timestamp                                              |

Index:
- `bySubscriptionId`
- `byCustomerId`

### `convex_billing_coupons`
Stores Stripe subscriptions.

| Field            | Type            | Description                               |
| ---------------- | --------------- | ----------------------------------------- |
| `_id`            | `string`        | Convex document ID                        |
| `couponId`       | `string`        | Stripe coupon ID                          |
| `stripe`         | `Stripe.Coupon` | Full Stripe coupon object `Stripe.Coupon` |
| `last_synced_at` | `number`        | Last sync timestamp                       |

Index:
- `byCouponId`

### `convex_billing_promotion_codes`
Stores Stripe subscriptions.

| Field             | Type                   | Description                                              |
| ----------------- | ---------------------- | -------------------------------------------------------- |
| `_id`             | `string`               | Convex document ID                                       |
| `promotionCodeId` | `string`               | Stripe promotion code ID                                 |
| `stripe`          | `Stripe.PromotionCode` | Full Stripe promotion code object `Stripe.PromotionCode` |
| `last_synced_at`  | `number`               | Last sync timestamp                                      |

Index:
- `byPromotionCodeId`

### `convex_billing_payouts`
Stores Stripe subscriptions.

| Field            | Type            | Description                               |
| ---------------- | --------------- | ----------------------------------------- |
| `_id`            | `string`        | Convex document ID                        |
| `payoutId`       | `string`        | Stripe payout ID                          |
| `stripe`         | `Stripe.Payout` | Full Stripe payout object `Stripe.Payout` |
| `last_synced_at` | `number`        | Last sync timestamp                       |

> ⚡ These tables are **synced automatically** via webhooks and cron jobs.  
> You can query them directly in your Convex functions to check products, prices, and subscription status.