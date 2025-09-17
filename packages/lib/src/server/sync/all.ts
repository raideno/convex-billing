import { defineActionImplementation } from "@/helpers";
import { v } from "convex/values";

import { CheckoutSessionsSyncImplementation } from "./checkouts-session";
import { CouponsSyncImplementation } from "./coupons";
import { CustomersSyncImplementation } from "./customers";
import { InvoicesSyncImplementation } from "./invoices";
import { PaymentIntentsSyncImplementation } from "./payment-intent";
import { PayoutsSyncImplementation } from "./payouts";
import { PricesSyncImplementation } from "./prices";
import { ProductsSyncImplementation } from "./products";
import { PromotionCodesSyncImplementation } from "./promotion-codes";
import { RefundsSyncImplementation } from "./refunds";
import { ReviewsSyncImplementation } from "./reviews";
import { SubscriptionsSyncImplementation } from "./subscriptions";

export const SyncAllImplementation = defineActionImplementation({
  args: v.object({}),
  name: "sync",
  handler: async (context, args, configuration) => {
    const syncs = [
      configuration.sync.convex_stripe_customers && CustomersSyncImplementation,
      configuration.sync.convex_stripe_coupons && CouponsSyncImplementation,
      configuration.sync.convex_stripe_payouts && PayoutsSyncImplementation,
      configuration.sync.convex_stripe_prices && PricesSyncImplementation,
      configuration.sync.convex_stripe_products && ProductsSyncImplementation,
      configuration.sync.convex_stripe_promotion_codes &&
        PromotionCodesSyncImplementation,
      configuration.sync.convex_stripe_subscriptions &&
        SubscriptionsSyncImplementation,
      configuration.sync.convex_stripe_refunds && RefundsSyncImplementation,
      configuration.sync.convex_stripe_checkout_sessions &&
        CheckoutSessionsSyncImplementation,
      configuration.sync.convex_stripe_payment_intents &&
        PaymentIntentsSyncImplementation,
      configuration.sync.convex_stripe_invoices && InvoicesSyncImplementation,
      configuration.sync.convex_stripe_reviews && ReviewsSyncImplementation,
    ];

    for (const sync of syncs) {
      if (sync) await sync.handler(context, {}, configuration);
    }
  },
});
