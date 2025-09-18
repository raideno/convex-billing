import {
  DataModelFromSchemaDefinition,
  defineSchema,
  defineTable,
} from "convex/server";
import { v } from "convex/values";

import { ChargeSchema } from "@/schema/charge";
import { CheckoutSessionSchema } from "@/schema/checkout-session";
import { CouponSchema } from "@/schema/coupon";
import { CreditNoteSchema } from "@/schema/credit-note";
import { CustomerSchema } from "@/schema/customer";
import { DisputeSchema } from "@/schema/dispute";
import { EarlyFraudWarningSchema } from "@/schema/early-fraud-warning";
import { InvoiceSchema } from "@/schema/invoice";
import { PaymentIntentSchema } from "@/schema/payment-intent";
import { PaymentMethodSchema } from "@/schema/payment-method";
import { PayoutSchema } from "@/schema/payout";
import { PlanSchema } from "@/schema/plan";
import { PriceSchema } from "@/schema/price";
import { ProductSchema } from "@/schema/product";
import { PromotionCodeSchema } from "@/schema/promotion-code";
import { RefundSchema } from "@/schema/refund";
import { ReviewSchema } from "@/schema/review";
import { SetupIntentSchema } from "@/schema/setup-intent";
import { SubscriptionObject } from "@/schema/subscription";
import { SubscriptionScheduleSchema } from "@/schema/subscription-schedule";
import { TaxIdSchema } from "@/schema/tax-id";

export const stripeTables = {
  stripe_products: defineTable({
    productId: v.string(),
    stripe: v.object(ProductSchema),
    last_synced_at: v.number(),
  })
    .index("byActive", ["stripe.active"])
    .index("byName", ["stripe.name"]),
  stripe_prices: defineTable({
    priceId: v.string(),
    stripe: v.object(PriceSchema),
    last_synced_at: v.number(),
  })
    .index("byPriceId", ["priceId"])
    .index("byActive", ["stripe.active"])
    .index("byRecurringInterval", ["stripe.recurring.interval"])
    .index("byCurrency", ["stripe.currency"]),
  stripe_customers: defineTable({
    customerId: v.string(),
    entityId: v.string(),
    stripe: v.object(CustomerSchema),
    last_synced_at: v.number(),
  })
    .index("byCustomerId", ["customerId"])
    .index("byEntityId", ["entityId"]),
  stripe_subscriptions: defineTable({
    subscriptionId: v.union(v.string(), v.null()),
    customerId: v.string(),
    stripe: SubscriptionObject,
    last_synced_at: v.number(),
  })
    .index("bySubscriptionId", ["subscriptionId"])
    .index("byCustomerId", ["customerId"]),
  stripe_coupons: defineTable({
    couponId: v.string(),
    stripe: v.object(CouponSchema),
    last_synced_at: v.number(),
  }).index("byCouponId", ["couponId"]),
  stripe_promotion_codes: defineTable({
    promotionCodeId: v.string(),
    stripe: v.object(PromotionCodeSchema),
    last_synced_at: v.number(),
  }).index("byPromotionCodeId", ["promotionCodeId"]),
  stripe_payouts: defineTable({
    payoutId: v.string(),
    stripe: v.object(PayoutSchema),
    last_synced_at: v.number(),
  }).index("byPayoutId", ["payoutId"]),
  stripe_refunds: defineTable({
    refundId: v.string(),
    stripe: v.object(RefundSchema),
    last_synced_at: v.number(),
  }).index("byRefundId", ["refundId"]),
  stripe_payment_intents: defineTable({
    paymentIntentId: v.string(),
    stripe: v.object(PaymentIntentSchema),
    last_synced_at: v.number(),
  }).index("byPaymentIntentId", ["paymentIntentId"]),
  stripe_checkout_sessions: defineTable({
    checkoutSessionId: v.string(),
    stripe: v.object(CheckoutSessionSchema),
    last_synced_at: v.number(),
  }).index("byCheckoutSessionId", ["checkoutSessionId"]),
  stripe_invoices: defineTable({
    invoiceId: v.string(),
    stripe: v.object(InvoiceSchema),
    last_synced_at: v.number(),
  }).index("byInvoiceId", ["invoiceId"]),
  stripe_reviews: defineTable({
    reviewId: v.string(),
    stripe: v.object(ReviewSchema),
    last_synced_at: v.number(),
  }).index("reviewId", ["reviewId"]),
  stripe_plans: defineTable({
    planId: v.string(),
    stripe: v.object(PlanSchema),
    last_synced_at: v.number(),
  }).index("byPlanId", ["planId"]),
  stripe_disputes: defineTable({
    disputeId: v.string(),
    stripe: v.object(DisputeSchema),
    last_synced_at: v.number(),
  }).index("byDisputeId", ["disputeId"]),
  stripe_early_fraud_warnings: defineTable({
    earlyFraudWarningId: v.string(),
    stripe: v.object(EarlyFraudWarningSchema),
    last_synced_at: v.number(),
  }).index("byEarlyFraudWarningId", ["earlyFraudWarningId"]),
  stripe_tax_ids: defineTable({
    taxIdId: v.string(),
    stripe: v.object(TaxIdSchema),
    last_synced_at: v.number(),
  }).index("byTaxIdId", ["taxIdId"]),
  stripe_setup_intents: defineTable({
    setupIntentId: v.string(),
    stripe: v.object(SetupIntentSchema),
    last_synced_at: v.number(),
  }).index("bySetupIntentId", ["setupIntentId"]),
  stripe_credit_notes: defineTable({
    creditNoteId: v.string(),
    stripe: v.object(CreditNoteSchema),
    last_synced_at: v.number(),
  }).index("byCreditNoteId", ["creditNoteId"]),
  stripe_charges: defineTable({
    chargeId: v.string(),
    stripe: v.object(ChargeSchema),
    last_synced_at: v.number(),
  }).index("byChargeId", ["chargeId"]),
  stripe_payment_methods: defineTable({
    paymentMethodId: v.string(),
    stripe: v.object(PaymentMethodSchema),
    last_synced_at: v.number(),
  }).index("byPaymentMethodId", ["paymentMethodId"]),
  stripe_subscription_schedules: defineTable({
    subscriptionScheduleId: v.string(),
    stripe: v.object(SubscriptionScheduleSchema),
    last_synced_at: v.number(),
  }).index("bySubscriptionScheduleId", ["subscriptionScheduleId"]),
};

const stripeSchema = defineSchema(stripeTables);

export type StripeDataModel = DataModelFromSchemaDefinition<
  typeof stripeSchema
>;
