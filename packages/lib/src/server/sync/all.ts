import { defineActionImplementation } from "@/helpers";
import { v } from "convex/values";

import { CheckoutSessionsSyncImplementation } from "./checkouts-session";
import { CouponsSyncImplementation } from "./coupons";
import { CustomersSyncImplementation } from "./customers";
import { PaymentIntentsSyncImplementation } from "./payment-intent";
import { PayoutsSyncImplementation } from "./payouts";
import { PricesSyncImplementation } from "./prices";
import { ProductsSyncImplementation } from "./products";
import { PromotionCodesSyncImplementation } from "./promotion-codes";
import { RefundsSyncImplementation } from "./refunds";
import { SubscriptionsSyncImplementation } from "./subscriptions";

export const SyncAllImplementation = defineActionImplementation({
  args: v.object({}),
  name: "sync",
  handler: async (context, args, configuration) => {
    await Promise.all([
      configuration.sync.convex_billing_subscriptions
        ? CouponsSyncImplementation.handler(context, args, configuration)
        : null,
      configuration.sync.convex_billing_subscriptions
        ? CustomersSyncImplementation.handler(context, args, configuration)
        : null,
      configuration.sync.convex_billing_subscriptions
        ? PayoutsSyncImplementation.handler(context, args, configuration)
        : null,
      configuration.sync.convex_billing_subscriptions
        ? PricesSyncImplementation.handler(context, args, configuration)
        : null,
      configuration.sync.convex_billing_subscriptions
        ? ProductsSyncImplementation.handler(context, args, configuration)
        : null,
      configuration.sync.convex_billing_subscriptions
        ? PromotionCodesSyncImplementation.handler(context, args, configuration)
        : null,
      // configuration.sync.convex_billing_subscriptions ? SubscriptionSyncImplementation.handler(context, args, configuration) : null,
      configuration.sync.convex_billing_subscriptions
        ? SubscriptionsSyncImplementation.handler(context, args, configuration)
        : null,
      configuration.sync.convex_billing_subscriptions
        ? RefundsSyncImplementation.handler(context, args, configuration)
        : null,
      configuration.sync.convex_billing_checkout_sessions
        ? CheckoutSessionsSyncImplementation.handler(
            context,
            args,
            configuration
          )
        : null,
      configuration.sync.convex_billing_payment_intents
        ? PaymentIntentsSyncImplementation.handler(context, args, configuration)
        : null,
    ]);
  },
});
