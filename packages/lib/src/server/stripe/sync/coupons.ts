import { Infer } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { billingDispatchTyped } from "@/operations/helpers";
import { CouponSchema } from "@/schema/coupon";

export const CouponsSyncImplementation = defineActionImplementation({
  args: {},
  name: "coupons",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localCouponsRes = await billingDispatchTyped(
      {
        op: "selectAll",
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
          op: "upsert",
          table: "convex_billing_coupons",
          idField: "couponId",
          data: {
            couponId: coupon.id,
            stripe: {
              ...coupon,
              currency:
                (coupon.currency as Infer<(typeof CouponSchema)["currency"]>) ||
                undefined,
            },
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
            op: "deleteById",
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
