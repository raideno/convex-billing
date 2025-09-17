# Convex Stripe

| Status      | Features                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------- |
| ✅ Supported | Subscriptions, One‑time payments, Checkout, Billing portal, Sync webhooks, Multi-tenant. |
| 🚧 Planned   | Usage tracking and credits.                                                              |

A demo project is available at [https://convex-stripe-demo.vercel.app/](https://convex-stripe-demo.vercel.app/).

Stripe [syncing](#📑-table-schemas), subscriptions and [checkouts](#-checkout-action) for Convex apps. Implemented according to the best practices listed in [Theo's Stripe Recommendations](https://github.com/t3dotgg/stripe-recommendations).


## 🚀 Installation

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

3. **Add stripe tables** to your schema:

Check [📑 Tables Schema](#📑-table-schemas) to know more about synced tables.

```ts [convex/schema.ts]
import { defineSchema } from "convex/server";
import { stripeTables } from "@raideno/convex-stripe/server";

export default defineSchema({
  ...stripeTables,
  // your other tables...
});
```

4. **Initialize the library** in `convex/stripe.ts`:

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

5. **Register HTTP routes** in `convex/http.ts`:

```ts [convex/http.ts]
import { httpRouter } from "convex/server";
import { stripe } from "./stripe";

const http = httpRouter();

// registers POST /stripe/webhook
// registers GET /stripe/return/*
stripe.addHttpRoutes(http);

export default http;
```

6. **Create Stripe customers** when entities (users/orgs) are created.  
  Example with [convex-auth](https://labs.convex.dev/auth):

```ts [convex/auth.ts]
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

7. **Run sync action** go to your project's dashboard in the convex website.  
  In the *Functions* section search for a function called `sync` and run it. This is to sync already existing stripe data into convex.
  It must be done in both your development and production deployment.  
  This might not be necessary if you are starting with a fresh empty stripe project.

## 🏢 Organization-Based stripe

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

    await context.scheduler.runAfter(0, internal.stripe.setup, {
      entityId: orgId,
    });

    return orgId;
  },
});
```


## 📦 Usage

The library automatically syncs:

<!-- no toc -->
- [`stripe_products`](#stripe_products)
- [`stripe_prices`](#stripe_prices)
- [`stripe_customers`](#stripe_customers)
- [`stripe_subscriptions`](#stripe_subscriptions)
- [`stripe_payouts`](#stripe_payouts)
- [`stripe_refunds`](#stripe_refunds)
- [`stripe_promotion_codes`](#stripe_promotion_codes)
- [`stripe_coupons`](#stripe_coupons)
- [`stripe_checkout_sessions`](#stripe_checkout_sessions)
- [`stripe_payment_intents`](#stripe_payment_intents)
- [`stripe_invoices`](#stripe_invoices)
- [`stripe_reviews`](#stripe_reviews)
- [`stripe_plans`](#stripe_plans)

You can query these tables at any time to:

- List available products/plans and prices.
- Retrieve customers and their `customerId`.
- Check active subscriptions.

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

**📌 Notes:**

- `entityId` is your app’s internal ID (user/org).
- `customerId` is stripe's internal ID.
- `email` is optional, but recommended so the Stripe customer has a contact email.
- If the entity already has a Stripe customer, setup will return the existing one instead of creating a duplicate.
- Typically, you’ll call this automatically in your user/org creation flow (see [⚙️ Configuration - 7](#️⚙️-configuration)).

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

## ✅ Best Practices

- Always create a Stripe customer (`setup`) when a new entity is created.  
- Use `metadata` or `marketing_features` on products to store feature flags or limits.  
- Run `sync` when you first configure the extension to sync already existing stripe resources.  
- Never expose internal actions directly to clients, wrap them in public actions with proper authorization.

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

**Coupons:**
- `coupon.created`
- `coupon.updated`
- `coupon.deleted`

**Promotion Codes:**
- `promotion_code.created`
- `promotion_code.updated`

**Payouts:**
- `payout.canceled`
- `payout.created`
- `payout.failed`
- `payout.paid`
- `payout.updated`
- `payout.reconciliation_completed`

**Refunds:**
- `refund.created`
- `refund.updated`
- `refund.failed`

**Customers:**
- `customer.created`
- `customer.updated`
- `customer.deleted`

**Checkout Sessions:**
- `checkout.session.async_payment_failed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.completed`
- `checkout.session.expired`

**Payment Intents:**
- `payment_intent.created`
- `payment_intent.amount_capturable_updated`
- `payment_intent.canceled`
- `payment_intent.partially_funded`
- `payment_intent.payment_failed`
- `payment_intent.processing`
- `payment_intent.requires_action`
- `payment_intent.succeeded`

**Invoices:**
- `invoice.created`
- `invoice.deleted`
- `invoice.finalization_failed`
- `invoice.finalized`
- `invoice.marked_uncollectible`
- `invoice.overdue`
- `invoice.overpaid`
- `invoice.paid`
- `invoice.payment_action_required`
- `invoice.payment_failed`
- `invoice.payment_succeeded`
- `invoice.sent`
- `invoice.upcoming`
- `invoice.updated`
- `invoice.voided`
- `invoice.will_be_due`

**Reviews:**
- `...`

**Plans:**
- `plan.created`
- `plan.updated`
- `plan.deleted`

## 📚 Resources

- [Convex Documentation](https://docs.convex.dev)  
- [Stripe Documentation](https://stripe.com/docs)  
- [Demo App](https://convex-stripe-demo.vercel.app/)  
- [GitHub Repository](https://github.com/raideno/convex-stripe)
- [Theo's Stripe Recommendations](https://github.com/t3dotgg/stripe-recommendations)

## 📑 Table Schemas

When you spread `stripeTables` into your Convex schema, the following tables are created automatically:

### `stripe_products`
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

### `stripe_prices`
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

### `stripe_customers`
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


### `stripe_subscriptions`
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

### `stripe_coupons`
Stores Stripe coupons.

| Field            | Type            | Description                               |
| ---------------- | --------------- | ----------------------------------------- |
| `_id`            | `string`        | Convex document ID                        |
| `couponId`       | `string`        | Stripe coupon ID                          |
| `stripe`         | `Stripe.Coupon` | Full Stripe coupon object `Stripe.Coupon` |
| `last_synced_at` | `number`        | Last sync timestamp                       |

Index:
- `byCouponId`

### `stripe_promotion_codes`
Stores Stripe promotion codes.

| Field             | Type                   | Description                                              |
| ----------------- | ---------------------- | -------------------------------------------------------- |
| `_id`             | `string`               | Convex document ID                                       |
| `promotionCodeId` | `string`               | Stripe promotion code ID                                 |
| `stripe`          | `Stripe.PromotionCode` | Full Stripe promotion code object `Stripe.PromotionCode` |
| `last_synced_at`  | `number`               | Last sync timestamp                                      |

Index:
- `byPromotionCodeId`

### `stripe_payouts`
Stores Stripe payouts.

| Field            | Type            | Description                               |
| ---------------- | --------------- | ----------------------------------------- |
| `_id`            | `string`        | Convex document ID                        |
| `payoutId`       | `string`        | Stripe payout ID                          |
| `stripe`         | `Stripe.Payout` | Full Stripe payout object `Stripe.Payout` |
| `last_synced_at` | `number`        | Last sync timestamp                       |

Index:
- `byPayoutId`

### `stripe_refunds`
Stores Stripe refunds.

| Field            | Type            | Description                               |
| ---------------- | --------------- | ----------------------------------------- |
| `_id`            | `string`        | Convex document ID                        |
| `refundId`       | `string`        | Stripe refund ID                          |
| `stripe`         | `Stripe.Refund` | Full Stripe refund object `Stripe.Refund` |
| `last_synced_at` | `number`        | Last sync timestamp                       |

Index:
- `byRefundId`


### `stripe_checkout_sessions`
Stores Stripe checkout sessions.

| Field               | Type                      | Description                                                   |
| ------------------- | ------------------------- | ------------------------------------------------------------- |
| `_id`               | `string`                  | Convex document ID                                            |
| `checkoutSessionId` | `string`                  | Stripe checkout session ID                                    |
| `stripe`            | `Stripe.Checkout.Session` | Full Stripe checkout session object `Stripe.Checkout.Session` |
| `last_synced_at`    | `number`                  | Last sync timestamp                                           |

Index:
- `byCheckoutSessionId`

### `stripe_payment_intents`
Stores Stripe payment intents.

| Field             | Type                   | Description                                              |
| ----------------- | ---------------------- | -------------------------------------------------------- |
| `_id`             | `string`               | Convex document ID                                       |
| `paymentIntentId` | `string`               | Stripe payment intent ID                                 |
| `stripe`          | `Stripe.PaymentIntent` | Full Stripe payment intent object `Stripe.PaymentIntent` |
| `last_synced_at`  | `number`               | Last sync timestamp                                      |

Index:
- `byPaymentIntentId`

### `stripe_invoices`
Stores Stripe invoices.

| Field            | Type             | Description                                 |
| ---------------- | ---------------- | ------------------------------------------- |
| `_id`            | `string`         | Convex document ID                          |
| `invoiceId`      | `string`         | Stripe invoice ID                           |
| `stripe`         | `Stripe.Invoice` | Full Stripe invoice object `Stripe.Invoice` |
| `last_synced_at` | `number`         | Last sync timestamp                         |

Index:
- `byInvoiceId`

### `stripe_reviews`
Stores Stripe reviews.

| Field            | Type            | Description                               |
| ---------------- | --------------- | ----------------------------------------- |
| `_id`            | `string`        | Convex document ID                        |
| `reviewId`       | `string`        | Stripe review ID                          |
| `stripe`         | `Stripe.Review` | Full Stripe review object `Stripe.Review` |
| `last_synced_at` | `number`        | Last sync timestamp                       |

Index:
- `byInvoiceId`

### `stripe_plans`
Stores Stripe plans.

| Field            | Type          | Description                           |
| ---------------- | ------------- | ------------------------------------- |
| `_id`            | `string`      | Convex document ID                    |
| `planId`         | `string`      | Stripe plan ID                        |
| `stripe`         | `Stripe.Plan` | Full Stripe plan object `Stripe.Plan` |
| `last_synced_at` | `number`      | Last sync timestamp                   |

Index:
- `byPlanId`

> ⚡ These tables are **synced automatically** via webhooks.  
> You can query them directly in your Convex functions to check products, prices, and subscription status.
