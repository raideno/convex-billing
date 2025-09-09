# 🔧 References

## `InputConfiguration`

The **input configuration** is what you provide when calling
`internalConvexBilling`.
Some fields are optional and defaults will be applied automatically.

```ts
export type InputConfiguration = {
  stripe: {
    secret_key: string;
    webhook_secret: string;
  };

  /** Which tables to sync */
  sync?: {
    convex_billing_coupons?: boolean;
    convex_billing_customers?: boolean;
    convex_billing_prices?: boolean;
    convex_billing_products?: boolean;
    convex_billing_promotion_codes?: boolean;
    convex_billing_subscriptions?: boolean;
    convex_billing_payouts?: boolean;
  };

  /** Enable verbose logging */
  debug?: boolean;

  /** Custom logger (defaults to internal Logger) */
  logger?: Logger;

  /** Namespace prefix for internal functions (default: "billing") */
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
Controls which Convex billing tables get synced from Stripe.
If omitted, **all tables are synced**.

| Table                            | Default | Purpose                     |
| -------------------------------- | ------- | --------------------------- |
| `convex_billing_products`        | `true`  | Sync Stripe products        |
| `convex_billing_prices`          | `true`  | Sync Stripe prices          |
| `convex_billing_customers`       | `true`  | Sync Stripe customers       |
| `convex_billing_subscriptions`   | `true`  | Sync Stripe subscriptions   |
| `convex_billing_coupons`         | `true`  | Sync Stripe coupons         |
| `convex_billing_promotion_codes` | `true`  | Sync Stripe promotion codes |
| `convex_billing_payouts`         | `true`  | Sync Stripe payout events   |

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
- Default: `"billing"` (since default file is `billing.ts`).
File path exporting internal actions.
Example: if `base = "subscriptions"`, actions will be registered under
`internal.subscriptions.*`.

### ✅ Example

```ts
import { internalConvexBilling } from "@raideno/convex-billing/server";

export const {
  billing,
  checkout,
  portal,
  setup,
  sync
} = internalConvexBilling({
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY!,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  debug: true,     // optional
  sync: {
    convex_billing_payouts: false, // disable syncing payouts
  },
});
```

📌 **Notes**
- Always provide both Stripe keys.
- If `sync` is omitted, **all syncable tables are enabled**.
- Use `debug` in development to troubleshoot Stripe webhooks.
