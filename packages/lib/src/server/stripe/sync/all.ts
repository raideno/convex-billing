import { defineActionImplementation } from "@/helpers";
import { CouponsSyncImplementation } from "./coupons";
import { CustomersSyncImplementation } from "./customers";
import { PayoutsSyncImplementation } from "./payouts";
import { PricesSyncImplementation } from "./prices";
import { ProductsSyncImplementation } from "./products";
import { PromotionCodesSyncImplementation } from "./promotion-codes";
import { RefundsSyncImplementation } from "./refunds";
import { SubscriptionsSyncImplementation } from "./subscriptions";

export const SyncAllImplementation = defineActionImplementation({
  args: {},
  name: "sync",
  handler: async (context, args, configuration) => {
    await Promise.all([
      CouponsSyncImplementation.handler(context, args, configuration),
      CustomersSyncImplementation.handler(context, args, configuration),
      PayoutsSyncImplementation.handler(context, args, configuration),
      PricesSyncImplementation.handler(context, args, configuration),
      ProductsSyncImplementation.handler(context, args, configuration),
      PromotionCodesSyncImplementation.handler(context, args, configuration),
      // SubscriptionSyncImplementation.handler(context, args, configuration),
      SubscriptionsSyncImplementation.handler(context, args, configuration),
      RefundsSyncImplementation.handler(context, args, configuration),
    ]);
  },
});
