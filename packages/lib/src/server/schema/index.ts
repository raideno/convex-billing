import {
  DataModelFromSchemaDefinition,
  defineSchema,
  defineTable,
  TableNamesInDataModel,
} from "convex/server";
import { v } from "convex/values";

import { CheckoutSessionSchema } from "@/schema/checkout-session";
import { CouponSchema } from "@/schema/coupon";
import { CustomerSchema } from "@/schema/customer";
import { InvoiceSchema } from "@/schema/invoice";
import { PaymentIntentSchema } from "@/schema/payment-intent";
import { PayoutSchema } from "@/schema/payout";
import { PriceSchema } from "@/schema/price";
import { ProductSchema } from "@/schema/product";
import { PromotionCodeSchema } from "@/schema/promotion-code";
import { RefundSchema } from "@/schema/refund";
import { ReviewSchema } from "@/schema/review";
import { SubscriptionObject } from "@/schema/subscription";
import { GenericDoc } from "@/types";

export const stripeTables = {
  convex_stripe_products: defineTable({
    productId: v.string(),
    stripe: v.object(ProductSchema),
    last_synced_at: v.number(),
  })
    .index("byActive", ["stripe.active"])
    .index("byName", ["stripe.name"]),
  convex_stripe_prices: defineTable({
    priceId: v.string(),
    stripe: v.object(PriceSchema),
    last_synced_at: v.number(),
  })
    .index("byPriceId", ["priceId"])
    .index("byActive", ["stripe.active"])
    .index("byRecurringInterval", ["stripe.recurring.interval"])
    .index("byCurrency", ["stripe.currency"]),
  convex_stripe_customers: defineTable({
    customerId: v.string(),
    entityId: v.string(),
    stripe: v.object(CustomerSchema),
    last_synced_at: v.number(),
  })
    .index("byCustomerId", ["customerId"])
    .index("byEntityId", ["entityId"]),
  convex_stripe_subscriptions: defineTable({
    subscriptionId: v.union(v.string(), v.null()),
    customerId: v.string(),
    stripe: SubscriptionObject,
    last_synced_at: v.number(),
  })
    .index("bySubscriptionId", ["subscriptionId"])
    .index("byCustomerId", ["customerId"]),
  convex_stripe_coupons: defineTable({
    couponId: v.string(),
    stripe: v.object(CouponSchema),
    last_synced_at: v.number(),
  }).index("byCouponId", ["couponId"]),
  convex_stripe_promotion_codes: defineTable({
    promotionCodeId: v.string(),
    stripe: v.object(PromotionCodeSchema),
    last_synced_at: v.number(),
  }).index("byPromotionCodeId", ["promotionCodeId"]),
  convex_stripe_payouts: defineTable({
    payoutId: v.string(),
    stripe: v.object(PayoutSchema),
    last_synced_at: v.number(),
  }).index("byPayoutId", ["payoutId"]),
  convex_stripe_refunds: defineTable({
    refundId: v.string(),
    stripe: v.object(RefundSchema),
    last_synced_at: v.number(),
  }).index("byRefundId", ["refundId"]),
  convex_stripe_payment_intents: defineTable({
    paymentIntentId: v.string(),
    stripe: v.object(PaymentIntentSchema),
    last_synced_at: v.number(),
  }).index("byPaymentIntentId", ["paymentIntentId"]),
  convex_stripe_checkout_sessions: defineTable({
    checkoutSessionId: v.string(),
    stripe: v.object(CheckoutSessionSchema),
    last_synced_at: v.number(),
  }).index("byCheckoutSessionId", ["checkoutSessionId"]),
  convex_stripe_invoices: defineTable({
    invoiceId: v.string(),
    stripe: v.object(InvoiceSchema),
    last_synced_at: v.number(),
  }).index("byInvoiceId", ["invoiceId"]),
  convex_stripe_reviews: defineTable({
    reviewId: v.string(),
    stripe: v.object(ReviewSchema),
    last_synced_at: v.number(),
  }).index("reviewId", ["reviewId"]),
};

const defaultSchema = defineSchema(stripeTables);

export type StripeDataModel = DataModelFromSchemaDefinition<
  typeof defaultSchema
>;

export type Doc<T extends TableNamesInDataModel<StripeDataModel>> = GenericDoc<
  StripeDataModel,
  T
>;
