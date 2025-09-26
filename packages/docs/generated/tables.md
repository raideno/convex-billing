## `stripeProducts`
Stores Stripe stripeProducts.

| Field        | Type      | Description         |
| :----------- | :-------- | :------------------ |
| productId    | `string`  |                     |
| stripe       | `object`  | Full Stripe object. |
| lastSyncedAt | `float64` |                     |


Indexes:
- `byActive`: `stripe.active`
- `byName`: `stripe.name`

## `stripePrices`
Stores Stripe stripePrices.

| Field        | Type      | Description         |
| :----------- | :-------- | :------------------ |
| priceId      | `string`  |                     |
| stripe       | `object`  | Full Stripe object. |
| lastSyncedAt | `float64` |                     |


Indexes:
- `byPriceId`: `priceId`
- `byActive`: `stripe.active`
- `byRecurringInterval`: `stripe.recurring.interval`
- `byCurrency`: `stripe.currency`

## `stripeCustomers`
Stores Stripe stripeCustomers.

| Field        | Type      | Description         |
| :----------- | :-------- | :------------------ |
| customerId   | `string`  |                     |
| entityId     | `string`  |                     |
| stripe       | `object`  | Full Stripe object. |
| lastSyncedAt | `float64` |                     |


Indexes:
- `byCustomerId`: `customerId`
- `byEntityId`: `entityId`

## `stripeSubscriptions`
Stores Stripe stripeSubscriptions.

| Field          | Type      | Description         |
| :------------- | :-------- | :------------------ |
| subscriptionId | `union`   |                     |
| customerId     | `string`  |                     |
| stripe         | `any`     | Full Stripe object. |
| lastSyncedAt   | `float64` |                     |


Indexes:
- `bySubscriptionId`: `subscriptionId`
- `byCustomerId`: `customerId`

## `stripeCoupons`
Stores Stripe stripeCoupons.

| Field        | Type      | Description         |
| :----------- | :-------- | :------------------ |
| couponId     | `string`  |                     |
| stripe       | `object`  | Full Stripe object. |
| lastSyncedAt | `float64` |                     |


Indexes:
- `byCouponId`: `couponId`

## `stripePromotionCodes`
Stores Stripe stripePromotionCodes.

| Field           | Type      | Description         |
| :-------------- | :-------- | :------------------ |
| promotionCodeId | `string`  |                     |
| stripe          | `object`  | Full Stripe object. |
| lastSyncedAt    | `float64` |                     |


Indexes:
- `byPromotionCodeId`: `promotionCodeId`

## `stripePayouts`
Stores Stripe stripePayouts.

| Field        | Type      | Description         |
| :----------- | :-------- | :------------------ |
| payoutId     | `string`  |                     |
| stripe       | `object`  | Full Stripe object. |
| lastSyncedAt | `float64` |                     |


Indexes:
- `byPayoutId`: `payoutId`

## `stripeRefunds`
Stores Stripe stripeRefunds.

| Field        | Type      | Description         |
| :----------- | :-------- | :------------------ |
| refundId     | `string`  |                     |
| stripe       | `object`  | Full Stripe object. |
| lastSyncedAt | `float64` |                     |


Indexes:
- `byRefundId`: `refundId`

## `stripePaymentIntents`
Stores Stripe stripePaymentIntents.

| Field           | Type      | Description         |
| :-------------- | :-------- | :------------------ |
| paymentIntentId | `string`  |                     |
| stripe          | `object`  | Full Stripe object. |
| lastSyncedAt    | `float64` |                     |


Indexes:
- `byPaymentIntentId`: `paymentIntentId`

## `stripeCheckoutSessions`
Stores Stripe stripeCheckoutSessions.

| Field             | Type      | Description         |
| :---------------- | :-------- | :------------------ |
| checkoutSessionId | `string`  |                     |
| stripe            | `object`  | Full Stripe object. |
| lastSyncedAt      | `float64` |                     |


Indexes:
- `byCheckoutSessionId`: `checkoutSessionId`

## `stripeInvoices`
Stores Stripe stripeInvoices.

| Field        | Type      | Description         |
| :----------- | :-------- | :------------------ |
| invoiceId    | `string`  |                     |
| stripe       | `object`  | Full Stripe object. |
| lastSyncedAt | `float64` |                     |


Indexes:
- `byInvoiceId`: `invoiceId`

## `stripeReviews`
Stores Stripe stripeReviews.

| Field        | Type      | Description         |
| :----------- | :-------- | :------------------ |
| reviewId     | `string`  |                     |
| stripe       | `object`  | Full Stripe object. |
| lastSyncedAt | `float64` |                     |


Indexes:
- `reviewId`: `reviewId`

## `stripePlans`
Stores Stripe stripePlans.

| Field        | Type      | Description         |
| :----------- | :-------- | :------------------ |
| planId       | `string`  |                     |
| stripe       | `object`  | Full Stripe object. |
| lastSyncedAt | `float64` |                     |


Indexes:
- `byPlanId`: `planId`

## `stripeDisputes`
Stores Stripe stripeDisputes.

| Field        | Type      | Description         |
| :----------- | :-------- | :------------------ |
| disputeId    | `string`  |                     |
| stripe       | `object`  | Full Stripe object. |
| lastSyncedAt | `float64` |                     |


Indexes:
- `byDisputeId`: `disputeId`

## `stripeEarlyFraudWarnings`
Stores Stripe stripeEarlyFraudWarnings.

| Field               | Type      | Description         |
| :------------------ | :-------- | :------------------ |
| earlyFraudWarningId | `string`  |                     |
| stripe              | `object`  | Full Stripe object. |
| lastSyncedAt        | `float64` |                     |


Indexes:
- `byEarlyFraudWarningId`: `earlyFraudWarningId`

## `stripeTaxIds`
Stores Stripe stripeTaxIds.

| Field        | Type      | Description         |
| :----------- | :-------- | :------------------ |
| taxIdId      | `string`  |                     |
| stripe       | `object`  | Full Stripe object. |
| lastSyncedAt | `float64` |                     |


Indexes:
- `byTaxIdId`: `taxIdId`

## `stripeSetupIntents`
Stores Stripe stripeSetupIntents.

| Field         | Type      | Description         |
| :------------ | :-------- | :------------------ |
| setupIntentId | `string`  |                     |
| stripe        | `object`  | Full Stripe object. |
| lastSyncedAt  | `float64` |                     |


Indexes:
- `bySetupIntentId`: `setupIntentId`

## `stripeCreditNotes`
Stores Stripe stripeCreditNotes.

| Field        | Type      | Description         |
| :----------- | :-------- | :------------------ |
| creditNoteId | `string`  |                     |
| stripe       | `object`  | Full Stripe object. |
| lastSyncedAt | `float64` |                     |


Indexes:
- `byCreditNoteId`: `creditNoteId`

## `stripeCharges`
Stores Stripe stripeCharges.

| Field        | Type      | Description         |
| :----------- | :-------- | :------------------ |
| chargeId     | `string`  |                     |
| stripe       | `object`  | Full Stripe object. |
| lastSyncedAt | `float64` |                     |


Indexes:
- `byChargeId`: `chargeId`

## `stripePaymentMethods`
Stores Stripe stripePaymentMethods.

| Field           | Type      | Description         |
| :-------------- | :-------- | :------------------ |
| paymentMethodId | `string`  |                     |
| stripe          | `object`  | Full Stripe object. |
| lastSyncedAt    | `float64` |                     |


Indexes:
- `byPaymentMethodId`: `paymentMethodId`

## `stripeSubscriptionSchedules`
Stores Stripe stripeSubscriptionSchedules.

| Field                  | Type      | Description         |
| :--------------------- | :-------- | :------------------ |
| subscriptionScheduleId | `string`  |                     |
| stripe                 | `object`  | Full Stripe object. |
| lastSyncedAt           | `float64` |                     |


Indexes:
- `bySubscriptionScheduleId`: `subscriptionScheduleId`