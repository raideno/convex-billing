import {
  DataModelFromSchemaDefinition,
  defineSchema,
  defineTable,
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  TableNamesInDataModel,
} from "convex/server";
import { v } from "convex/values";

import { GenericDoc } from "@/types";

import { CouponSchema } from "@/schema/coupon";
import { CustomerSchema } from "@/schema/customer";
import { PriceSchema } from "@/schema/price";
import { ProductSchema } from "@/schema/product";
import { PromotionCodeSchema } from "@/schema/promotion-code";
import { SubscriptionObject } from "@/schema/subscription";
import { PayoutSchema } from "./payout";
import { RefundSchema } from "./refund";

export const billingTables = {
  convex_billing_products: defineTable({
    productId: v.string(),
    stripe: v.object(ProductSchema),
    last_synced_at: v.number(),
  })
    .index("byActive", ["stripe.active"])
    .index("byName", ["stripe.name"]),
  convex_billing_prices: defineTable({
    priceId: v.string(),
    stripe: v.object(PriceSchema),
    last_synced_at: v.number(),
  })
    .index("byPriceId", ["priceId"])
    .index("byActive", ["stripe.active"])
    .index("byRecurringInterval", ["stripe.recurring.interval"])
    .index("byCurrency", ["stripe.currency"]),
  convex_billing_customers: defineTable({
    customerId: v.string(),
    entityId: v.string(),
    stripe: v.object(CustomerSchema),
    last_synced_at: v.number(),
  })
    .index("byCustomerId", ["customerId"])
    .index("byEntityId", ["entityId"]),
  convex_billing_subscriptions: defineTable({
    subscriptionId: v.union(v.string(), v.null()),
    customerId: v.string(),
    stripe: SubscriptionObject,
    last_synced_at: v.number(),
  })
    .index("bySubscriptionId", ["subscriptionId"])
    .index("byCustomerId", ["customerId"]),
  convex_billing_coupons: defineTable({
    couponId: v.string(),
    stripe: v.object(CouponSchema),
    last_synced_at: v.number(),
  }).index("byCouponId", ["couponId"]),
  convex_billing_promotion_codes: defineTable({
    promotionCodeId: v.string(),
    stripe: v.object(PromotionCodeSchema),
    last_synced_at: v.number(),
  }).index("byPromotionCodeId", ["promotionCodeId"]),
  convex_billing_payouts: defineTable({
    payoutId: v.string(),
    stripe: v.object(PayoutSchema),
    last_synced_at: v.number(),
  }).index("byPayoutId", ["payoutId"]),
  convex_billing_refunds: defineTable({
    refundId: v.string(),
    stripe: v.object(RefundSchema),
    last_synced_at: v.number(),
  }).index("byRefundId", ["refundId"]),
};

const defaultSchema = defineSchema(billingTables);

export type BillingDataModel = DataModelFromSchemaDefinition<
  typeof defaultSchema
>;
export type ActionCtx = GenericActionCtx<BillingDataModel>;
export type MutationCtx = GenericMutationCtx<BillingDataModel>;
export type QueryCtx = GenericQueryCtx<BillingDataModel>;
export type Doc<T extends TableNamesInDataModel<BillingDataModel>> = GenericDoc<
  BillingDataModel,
  T
>;
