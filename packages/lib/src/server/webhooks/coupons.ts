import { CouponStripeToConvex } from "@/schema/coupon";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export const CouponsWebhooksHandler = defineWebhookHandler({
  events: ["coupon.created", "coupon.updated", "coupon.deleted"],
  handle: async (event, context, configuration) => {
    const coupon = event.data.object;

    switch (event.type) {
      case "coupon.created":
      case "coupon.updated":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "convex_stripe_coupons",
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
        storeDispatchTyped(
          {
            operation: "deleteById",
            table: "convex_stripe_coupons",
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
