# Stripe Events

The following events are handled and synced automatically.

Depending on which resources you want and don't want to sync you might not need some events.

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
- `review.closed`
- `review.opened`

**Plans:**
- `plan.created`
- `plan.updated`
- `plan.deleted`

**Early Fraud Warnings:**
- `radar.early_fraud_warning.created`
- `radar.early_fraud_warning.updated`

**Disputes:**
- `charge.dispute.created`
- `charge.dispute.updated`
- `charge.dispute.closed`
- `charge.dispute.funds_reinstated`
- `charge.dispute.funds_withdrawn`

**Tax Ids:**
- `customer.tax_id.created`
- `customer.tax_id.deleted`
- `customer.tax_id.updated`

**Setup Intents:**
- `setup_intent.canceled`
- `setup_intent.created`
- `setup_intent.requires_action`
- `setup_intent.setup_failed`
- `setup_intent.succeeded`

**Credit Notes:**
- `credit_note.created`
- `credit_note.updated`
- `credit_note.voided`

**Charges:**
- `charge.captured`
- `charge.expired`
- `charge.failed`
- `charge.pending`
- `charge.refunded`
- `charge.succeeded`
- `charge.updated`

**Payment Methods:**
- `payment_method.attached`
- `payment_method.automatically_updated`
- `payment_method.detached`
- `payment_method.updated`

**Subscription Schedules:**
- `subscription_schedule.aborted`
- `subscription_schedule.canceled`
- `subscription_schedule.completed`
- `subscription_schedule.created`
- `subscription_schedule.expiring`
- `subscription_schedule.released`
- `subscription_schedule.updated`
