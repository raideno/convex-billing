# 🔧 References

## `InputConfiguration`

The **input configuration** is what you provide when calling
`internalConvexStripe`.
Some fields are optional and defaults will be applied automatically.

```ts
export type InputConfiguration = {
  stripe: {
    secret_key: string;
    webhook_secret: string;
  };

  /** Which tables to sync */
  sync?: {
    stripe_coupons?: boolean;
    stripe_customers?: boolean;
    stripe_prices?: boolean;
    stripe_products?: boolean;
    stripe_promotion_codes?: boolean;
    stripe_subscriptions?: boolean;
    stripe_payouts?: boolean;
    stripe_refunds?: boolean;
    stripe_checkout_sessions?: boolean;
    stripe_payment_intents?: boolean;
    stripe_invoices?: boolean;
    stripe_reviews?: boolean;
    stripe_plans?: boolean;
  };

  /** Enable verbose logging */
  debug?: boolean;

  /** Custom logger (defaults to internal Logger) */
  logger?: Logger;

  /** Namespace prefix for internal functions (default: "stripe") */
  base?: string;
};
```

### `stripe` (**required**)
Configuration for authenticating with Stripe.

| Key              | Type     | Description                                                                         | Required |
| ---------------- | -------- | ----------------------------------------------------------------------------------- | -------- |
| `secret_key`     | `string` | Stripe **secret key** (starts with `sk_...`). Used to call Stripe APIs.             | ✅ Yes    |
| `webhook_secret` | `string` | Stripe **webhook signing secret** (starts with `whsec_...`). Used to verify events. | ✅ Yes    |

### `sync` (optional)
Controls which Convex tables get synced from Stripe.
If omitted, **all tables are synced**.

| Table                      | Default | Purpose                       |
| -------------------------- | ------- | ----------------------------- |
| `stripe_products`          | `true`  | Sync products                 |
| `stripe_prices`            | `true`  | Sync prices                   |
| `stripe_customers`         | `true`  | Sync customers                |
| `stripe_subscriptions`     | `true`  | Sync subscriptions            |
| `stripe_coupons`           | `true`  | Sync coupons                  |
| `stripe_promotion_codes`   | `true`  | Sync promotion codes          |
| `stripe_refunds`           | `true`  | Sync refunds events           |
| `stripe_payouts`           | `true`  | Sync payout events            |
| `stripe_payment_intents`   | `true`  | Sync payment intents events   |
| `stripe_checkout_sessions` | `true`  | Sync checkout sessions events |
| `stripe_invoices`          | `true`  | Sync invoices events          |
| `stripe_reviews`           | `true`  | Sync reviews events           |
| `stripe_plans`             | `true`  | Sync plans events             |

### `debug` (optional)
- Type: `boolean`.
- Default: `false`.
If enabled, logs detailed information about sync operations, webhook processing,
and internal actions.

### `logger` (optional)
- Type: `Logger`.
- Default: an instance of the library’s own `Logger`.
Allows injecting a custom logging implementation.

### `base` (optional)
- Type: `string`.
- Default: `"stripe"` (since default file is `stripe.ts`).
File path exporting internal actions.
Example: if `base = "subscriptions"`, actions will be registered under
`internal.subscriptions.*`.

### ✅ Example

```ts
import { internalConvexStripe } from "@raideno/convex-stripe/server";

export const { stripe, store, sync, setup } = internalConvexStripe({
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  debug: true,     // optional
  sync: {
    stripe_payouts: false, // disable syncing payouts
  },
});
```

📌 **Notes**
- Always provide both Stripe keys.
- If `sync` is omitted, **all syncable tables are enabled**.
- Use `debug` in development to troubleshoot Stripe webhooks.
