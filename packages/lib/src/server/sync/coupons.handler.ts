import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { CouponStripeToConvex } from "@/schema/coupon";
import { storeDispatchTyped } from "@/store";

export const CouponsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "coupons",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripeCoupons !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localCouponsRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripeCoupons",
      },
      context,
      configuration
    );
    const localCouponsById = new Map(
      (localCouponsRes.docs || []).map((p: any) => [p.couponId, p])
    );

    const coupons = await stripe.coupons
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripeCouponIds = new Set<string>();

    for (const coupon of coupons) {
      stripeCouponIds.add(coupon.id);

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripeCoupons",
          idField: "couponId",
          data: {
            couponId: coupon.id,
            stripe: CouponStripeToConvex(coupon),
            lastSyncedAt: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [couponId] of localCouponsById.entries()) {
      if (!stripeCouponIds.has(couponId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripeCoupons",
            idField: "couponId",
            idValue: couponId,
          },
          context,
          configuration
        );
      }
    }
  },
});
