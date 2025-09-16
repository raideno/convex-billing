import {
  DataModelFromSchemaDefinition,
  defineSchema,
  defineTable,
  TableNamesInDataModel,
} from "convex/server";
import { v } from "convex/values";

import { CouponSchema } from "@/schema/coupon";
import { CustomerSchema } from "@/schema/customer";
import { PriceSchema } from "@/schema/price";
import { ProductSchema } from "@/schema/product";
import { PromotionCodeSchema } from "@/schema/promotion-code";
import { SubscriptionObject } from "@/schema/subscription";
import { GenericDoc } from "@/types";

import { CheckoutSessionSchema } from "./checkout-session";
import { PaymentIntentSchema } from "./payment-intent";
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
  // --- --- ---
  convex_billing_payment_intents: defineTable({
    paymentIntentId: v.string(),
    stripe: v.object(PaymentIntentSchema),
    last_synced_at: v.number(),
  }).index("byPaymentIntentId", ["paymentIntentId"]),
  convex_billing_checkout_sessions: defineTable({
    checkoutSessionId: v.string(),
    stripe: v.object(CheckoutSessionSchema),
    last_synced_at: v.number(),
  }).index("byCheckoutSessionId", ["checkoutSessionId"]),
  // --- --- ---
  /*
    - So when a customer is ready to pay for an order, we create a checkout session for the order and put order_id in the metadata.
      This will automatically create a checkout session with a payment intent attached to it.
    - We then redirect the customer to the checkout session url to complete the payment.
      And we set the redirect url to a convex backend route handled by the library so we could sync everything after the payment is completed.
      And this way when the user is redirected to the frontend, they can be sure the payment have a status.
      Just like we do with the subscription checkout and customer portal.
    - After coming back from the checkout, the developer will need to check in the checkout's, the one associated with the orderId and see if it has been paid or not.
      They can be sure that the order_id metadata is present in there.
    - NOTE: This flow works well for e-commerce and product purchase with orders and stuff. But if they want to purchase credits for example.
      One could imagine that after the payment is completed, the developer would want the customer to receive the credits or something like that.
      This is why when creating the checkout session, it'll be possible to pass in a function that will automatically be called after the payment is completed, or failed, or canceled, etc.
      This way the developer don't even have to bother checking the checkout and intent status, etc.
  */
  // --- --- ---
  // TODO: we usually don't create a payment intent, the payment intent is automatically created when a checkout is created with "payment" mode
  // TODO: what happens when the mode is set to subscription or setup ?
  // checkouts: {},
  // NOTE: represents a payment, contains a status that you can use to check if it's been paid or not
  // It is recommended to create a payment intent for each order you want to take payment for
  // payment_intents: {},
  // --- --- ---
  // // 1- you create an order with the plugin
  // // 2- you get a link for the order to be paid
  // // 3- you pay the order
  // // 4- the order checkout section will be filled, tadaaaam!
  // convex_orders: defineTable({
  //   entityId: v.string(),
  //   metadata: v.optional(v.union(metadata(), v.null())),
  //   content: v.union(
  //     v.object({
  //       amount: v.number(),
  //     }),
  //     v.array(
  //       v.object({
  //         priceId: v.string(),
  //       })
  //     )
  //   ),
  //   checkouts: v.array(
  //     v.object({
  //       // TODO: all checkout attempts
  //     })
  //   ),
  // }),
};

const defaultSchema = defineSchema(billingTables);

export type BillingDataModel = DataModelFromSchemaDefinition<
  typeof defaultSchema
>;

export type Doc<T extends TableNamesInDataModel<BillingDataModel>> = GenericDoc<
  BillingDataModel,
  T
>;

export * from "./currencies";
