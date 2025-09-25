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
  stripeProducts: defineTable({
    productId: v.string(),
    stripe: v.object(ProductSchema),
    lastSyncedAt: v.number(),
  })
    .index("byActive", ["stripe.active"])
    .index("byName", ["stripe.name"]),
  stripePrices: defineTable({
    priceId: v.string(),
    stripe: v.object(PriceSchema),
    lastSyncedAt: v.number(),
  })
    .index("byPriceId", ["priceId"])
    .index("byActive", ["stripe.active"])
    .index("byRecurringInterval", ["stripe.recurring.interval"])
    .index("byCurrency", ["stripe.currency"]),
  stripeCustomers: defineTable({
    customerId: v.string(),
    entityId: v.string(),
    stripe: v.object(CustomerSchema),
    lastSyncedAt: v.number(),
  })
    .index("byCustomerId", ["customerId"])
    .index("byEntityId", ["entityId"]),
  stripeSubscriptions: defineTable({
    subscriptionId: v.union(v.string(), v.null()),
    customerId: v.string(),
    stripe: SubscriptionObject,
    lastSyncedAt: v.number(),
  })
    .index("bySubscriptionId", ["subscriptionId"])
    .index("byCustomerId", ["customerId"]),
  stripeCoupons: defineTable({
    couponId: v.string(),
    stripe: v.object(CouponSchema),
    lastSyncedAt: v.number(),
  }).index("byCouponId", ["couponId"]),
  stripePromotionCodes: defineTable({
    promotionCodeId: v.string(),
    stripe: v.object(PromotionCodeSchema),
    lastSyncedAt: v.number(),
  }).index("byPromotionCodeId", ["promotionCodeId"]),
  stripePayouts: defineTable({
    payoutId: v.string(),
    stripe: v.object(PayoutSchema),
    lastSyncedAt: v.number(),
  }).index("byPayoutId", ["payoutId"]),
  stripeRefunds: defineTable({
    refundId: v.string(),
    stripe: v.object(RefundSchema),
    lastSyncedAt: v.number(),
  }).index("byRefundId", ["refundId"]),
  stripePaymentIntents: defineTable({
    paymentIntentId: v.string(),
    stripe: v.object(PaymentIntentSchema),
    lastSyncedAt: v.number(),
  }).index("byPaymentIntentId", ["paymentIntentId"]),
  stripeCheckoutSessions: defineTable({
    checkoutSessionId: v.string(),
    stripe: v.object(CheckoutSessionSchema),
    lastSyncedAt: v.number(),
  }).index("byCheckoutSessionId", ["checkoutSessionId"]),
  stripeInvoices: defineTable({
    invoiceId: v.string(),
    stripe: v.object(InvoiceSchema),
    lastSyncedAt: v.number(),
  }).index("byInvoiceId", ["invoiceId"]),
  stripeReviews: defineTable({
    reviewId: v.string(),
    stripe: v.object(ReviewSchema),
    lastSyncedAt: v.number(),
  }).index("reviewId", ["reviewId"]),
  stripePlans: defineTable({
    planId: v.string(),
    stripe: v.object(PlanSchema),
    lastSyncedAt: v.number(),
  }).index("byPlanId", ["planId"]),
  stripeDisputes: defineTable({
    disputeId: v.string(),
    stripe: v.object(DisputeSchema),
    lastSyncedAt: v.number(),
  }).index("byDisputeId", ["disputeId"]),
  stripeEarlyFraudWarnings: defineTable({
    earlyFraudWarningId: v.string(),
    stripe: v.object(EarlyFraudWarningSchema),
    lastSyncedAt: v.number(),
  }).index("byEarlyFraudWarningId", ["earlyFraudWarningId"]),
  stripeTaxIds: defineTable({
    taxIdId: v.string(),
    stripe: v.object(TaxIdSchema),
    lastSyncedAt: v.number(),
  }).index("byTaxIdId", ["taxIdId"]),
  stripeSetupIntents: defineTable({
    setupIntentId: v.string(),
    stripe: v.object(SetupIntentSchema),
    lastSyncedAt: v.number(),
  }).index("bySetupIntentId", ["setupIntentId"]),
  stripeCreditNotes: defineTable({
    creditNoteId: v.string(),
    stripe: v.object(CreditNoteSchema),
    lastSyncedAt: v.number(),
  }).index("byCreditNoteId", ["creditNoteId"]),
  stripeCharges: defineTable({
    chargeId: v.string(),
    stripe: v.object(ChargeSchema),
    lastSyncedAt: v.number(),
  }).index("byChargeId", ["chargeId"]),
  stripePaymentMethods: defineTable({
    paymentMethodId: v.string(),
    stripe: v.object(PaymentMethodSchema),
    lastSyncedAt: v.number(),
  }).index("byPaymentMethodId", ["paymentMethodId"]),
  stripeSubscriptionSchedules: defineTable({
    subscriptionScheduleId: v.string(),
    stripe: v.object(SubscriptionScheduleSchema),
    lastSyncedAt: v.number(),
  }).index("bySubscriptionScheduleId", ["subscriptionScheduleId"]),
};

const stripeSchema = defineSchema(stripeTables);

export type StripeDataModel = DataModelFromSchemaDefinition<
  typeof stripeSchema
>;
