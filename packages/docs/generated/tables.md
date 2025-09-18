## `stripe_products`
  Stores Stripe stripe products.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| productId      | `string`  | Convex document ID. |
| stripe         | `object`  | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_prices`
  Stores Stripe stripe prices.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| priceId        | `string`  | Convex document ID. |
| stripe         | `object`  | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_customers`
  Stores Stripe stripe customers.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| customerId     | `string`  | Convex document ID. |
| entityId       | `string`  | Convex document ID. |
| stripe         | `object`  | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_subscriptions`
  Stores Stripe stripe subscriptions.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| subscriptionId | `union`   | Convex document ID. |
| customerId     | `string`  | Convex document ID. |
| stripe         | `any`     | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_coupons`
  Stores Stripe stripe coupons.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| couponId       | `string`  | Convex document ID. |
| stripe         | `object`  | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_promotion_codes`
  Stores Stripe stripe promotion codes.

  | Field           | Type      | Description         |
| :-------------- | :-------- | :------------------ |
| promotionCodeId | `string`  | Convex document ID. |
| stripe          | `object`  | Convex document ID. |
| last_synced_at  | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_payouts`
  Stores Stripe stripe payouts.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| payoutId       | `string`  | Convex document ID. |
| stripe         | `object`  | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_refunds`
  Stores Stripe stripe refunds.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| refundId       | `string`  | Convex document ID. |
| stripe         | `object`  | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_payment_intents`
  Stores Stripe stripe payment intents.

  | Field           | Type      | Description         |
| :-------------- | :-------- | :------------------ |
| paymentIntentId | `string`  | Convex document ID. |
| stripe          | `object`  | Convex document ID. |
| last_synced_at  | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_checkout_sessions`
  Stores Stripe stripe checkout sessions.

  | Field             | Type      | Description         |
| :---------------- | :-------- | :------------------ |
| checkoutSessionId | `string`  | Convex document ID. |
| stripe            | `object`  | Convex document ID. |
| last_synced_at    | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_invoices`
  Stores Stripe stripe invoices.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| invoiceId      | `string`  | Convex document ID. |
| stripe         | `object`  | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_reviews`
  Stores Stripe stripe reviews.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| reviewId       | `string`  | Convex document ID. |
| stripe         | `object`  | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_plans`
  Stores Stripe stripe plans.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| planId         | `string`  | Convex document ID. |
| stripe         | `object`  | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_disputes`
  Stores Stripe stripe disputes.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| disputeId      | `string`  | Convex document ID. |
| stripe         | `object`  | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_early_fraud_warnings`
  Stores Stripe stripe early fraud warnings.

  | Field               | Type      | Description         |
| :------------------ | :-------- | :------------------ |
| earlyFraudWarningId | `string`  | Convex document ID. |
| stripe              | `object`  | Convex document ID. |
| last_synced_at      | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_tax_ids`
  Stores Stripe stripe tax ids.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| taxIdId        | `string`  | Convex document ID. |
| stripe         | `object`  | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_setup_intents`
  Stores Stripe stripe setup intents.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| setupIntentId  | `string`  | Convex document ID. |
| stripe         | `object`  | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_credit_notes`
  Stores Stripe stripe credit notes.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| creditNoteId   | `string`  | Convex document ID. |
| stripe         | `object`  | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_charges`
  Stores Stripe stripe charges.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| chargeId       | `string`  | Convex document ID. |
| stripe         | `object`  | Convex document ID. |
| last_synced_at | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_payment_methods`
  Stores Stripe stripe payment methods.

  | Field           | Type      | Description         |
| :-------------- | :-------- | :------------------ |
| paymentMethodId | `string`  | Convex document ID. |
| stripe          | `object`  | Convex document ID. |
| last_synced_at  | `float64` | Convex document ID. |


  Indexes:
  - ...

## `stripe_subscription_schedules`
  Stores Stripe stripe subscription schedules.

  | Field                  | Type      | Description         |
| :--------------------- | :-------- | :------------------ |
| subscriptionScheduleId | `string`  | Convex document ID. |
| stripe                 | `object`  | Convex document ID. |
| last_synced_at         | `float64` | Convex document ID. |


  Indexes:
  - ...