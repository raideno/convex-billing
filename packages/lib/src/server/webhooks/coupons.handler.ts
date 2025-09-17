import { CouponStripeToConvex } from "@/schema/coupon";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: ["coupon.created", "coupon.updated", "coupon.deleted"],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripe_coupons !== true) return;

    const coupon = event.data.object;

    switch (event.type) {
      case "coupon.created":
      case "coupon.updated":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripe_coupons",
            idField: "couponId",
            data: {
              couponId: coupon.id,
              stripe: CouponStripeToConvex(coupon),
              last_synced_at: Date.now(),
            },
          },
          context,
          configuration
        );
        break;
      case "coupon.deleted":
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripe_coupons",
            idField: "couponId",
            idValue: coupon.id,
          },
          context,
          configuration
        );
        break;
    }
  },
});
