import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { CouponStripeToConvex } from "@/schema/coupon";
import { billingDispatchTyped } from "@/store";

export const CouponsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "coupons",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localCouponsRes = await billingDispatchTyped(
      {
        operation: "selectAll",
        table: "convex_billing_coupons",
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

      await billingDispatchTyped(
        {
          operation: "upsert",
          table: "convex_billing_coupons",
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
    }

    for (const [couponId] of localCouponsById.entries()) {
      if (!stripeCouponIds.has(couponId)) {
        await billingDispatchTyped(
          {
            operation: "deleteById",
            table: "convex_billing_coupons",
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
