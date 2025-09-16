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
    convex_stripe_coupons?: boolean;
    convex_stripe_customers?: boolean;
    convex_stripe_prices?: boolean;
    convex_stripe_products?: boolean;
    convex_stripe_promotion_codes?: boolean;
    convex_stripe_subscriptions?: boolean;
    convex_stripe_payouts?: boolean;
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

| Table                             | Default | Purpose                       |
| --------------------------------- | ------- | ----------------------------- |
| `convex_stripe_products`          | `true`  | Sync products                 |
| `convex_stripe_prices`            | `true`  | Sync prices                   |
| `convex_stripe_customers`         | `true`  | Sync customers                |
| `convex_stripe_subscriptions`     | `true`  | Sync subscriptions            |
| `convex_stripe_coupons`           | `true`  | Sync coupons                  |
| `convex_stripe_promotion_codes`   | `true`  | Sync promotion codes          |
| `convex_stripe_refunds`           | `true`  | Sync refunds events           |
| `convex_stripe_payouts`           | `true`  | Sync payout events            |
| `convex_stripe_payment_intents`   | `true`  | Sync payment intents events   |
| `convex_stripe_checkout_sessions` | `true`  | Sync checkout sessions events |

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
    convex_stripe_payouts: false, // disable syncing payouts
  },
});
```

📌 **Notes**
- Always provide both Stripe keys.
- If `sync` is omitted, **all syncable tables are enabled**.
- Use `debug` in development to troubleshoot Stripe webhooks.
