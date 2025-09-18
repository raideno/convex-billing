## `stripe_products`
  Stores Stripe stripe products.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| productId      | `string`  |                     |
| stripe         | `object`  | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_prices`
  Stores Stripe stripe prices.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| priceId        | `string`  |                     |
| stripe         | `object`  | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_customers`
  Stores Stripe stripe customers.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| customerId     | `string`  |                     |
| entityId       | `string`  |                     |
| stripe         | `object`  | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_subscriptions`
  Stores Stripe stripe subscriptions.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| subscriptionId | `union`   |                     |
| customerId     | `string`  |                     |
| stripe         | `any`     | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_coupons`
  Stores Stripe stripe coupons.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| couponId       | `string`  |                     |
| stripe         | `object`  | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_promotion_codes`
  Stores Stripe stripe promotion codes.

  | Field           | Type      | Description         |
| :-------------- | :-------- | :------------------ |
| promotionCodeId | `string`  |                     |
| stripe          | `object`  | Full Stripe object. |
| last_synced_at  | `float64` |                     |


  Indexes:
  - ...

## `stripe_payouts`
  Stores Stripe stripe payouts.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| payoutId       | `string`  |                     |
| stripe         | `object`  | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_refunds`
  Stores Stripe stripe refunds.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| refundId       | `string`  |                     |
| stripe         | `object`  | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_payment_intents`
  Stores Stripe stripe payment intents.

  | Field           | Type      | Description         |
| :-------------- | :-------- | :------------------ |
| paymentIntentId | `string`  |                     |
| stripe          | `object`  | Full Stripe object. |
| last_synced_at  | `float64` |                     |


  Indexes:
  - ...

## `stripe_checkout_sessions`
  Stores Stripe stripe checkout sessions.

  | Field             | Type      | Description         |
| :---------------- | :-------- | :------------------ |
| checkoutSessionId | `string`  |                     |
| stripe            | `object`  | Full Stripe object. |
| last_synced_at    | `float64` |                     |


  Indexes:
  - ...

## `stripe_invoices`
  Stores Stripe stripe invoices.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| invoiceId      | `string`  |                     |
| stripe         | `object`  | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_reviews`
  Stores Stripe stripe reviews.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| reviewId       | `string`  |                     |
| stripe         | `object`  | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_plans`
  Stores Stripe stripe plans.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| planId         | `string`  |                     |
| stripe         | `object`  | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_disputes`
  Stores Stripe stripe disputes.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| disputeId      | `string`  |                     |
| stripe         | `object`  | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_early_fraud_warnings`
  Stores Stripe stripe early fraud warnings.

  | Field               | Type      | Description         |
| :------------------ | :-------- | :------------------ |
| earlyFraudWarningId | `string`  |                     |
| stripe              | `object`  | Full Stripe object. |
| last_synced_at      | `float64` |                     |


  Indexes:
  - ...

## `stripe_tax_ids`
  Stores Stripe stripe tax ids.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| taxIdId        | `string`  |                     |
| stripe         | `object`  | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_setup_intents`
  Stores Stripe stripe setup intents.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| setupIntentId  | `string`  |                     |
| stripe         | `object`  | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_credit_notes`
  Stores Stripe stripe credit notes.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| creditNoteId   | `string`  |                     |
| stripe         | `object`  | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_charges`
  Stores Stripe stripe charges.

  | Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| chargeId       | `string`  |                     |
| stripe         | `object`  | Full Stripe object. |
| last_synced_at | `float64` |                     |


  Indexes:
  - ...

## `stripe_payment_methods`
  Stores Stripe stripe payment methods.

  | Field           | Type      | Description         |
| :-------------- | :-------- | :------------------ |
| paymentMethodId | `string`  |                     |
| stripe          | `object`  | Full Stripe object. |
| last_synced_at  | `float64` |                     |


  Indexes:
  - ...

## `stripe_subscription_schedules`
  Stores Stripe stripe subscription schedules.

  | Field                  | Type      | Description         |
| :--------------------- | :-------- | :------------------ |
| subscriptionScheduleId | `string`  |                     |
| stripe                 | `object`  | Full Stripe object. |
| last_synced_at         | `float64` |                     |


  Indexes:
  - ...