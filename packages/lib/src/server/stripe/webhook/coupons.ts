import { Infer } from "convex/values";
import Stripe from "stripe";

import { billingDispatchTyped } from "@/operations/helpers";
import { CouponSchema } from "@/schema/coupon";

import { defineWebhookHandler } from "./types";

export const CouponsWebhooksHandler = defineWebhookHandler({
  events: ["coupon.created", "coupon.updated", "coupon.deleted"],
  handle: async (event, context, configuration) => {
    const couponId = event.data.object.id;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    switch (event.type) {
      case "coupon.created":
      case "coupon.updated":
        const coupon = await stripe.coupons.retrieve(couponId);
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
                  (coupon.currency as Infer<
                    (typeof CouponSchema)["currency"]
                  >) || undefined,
              },
              last_synced_at: Date.now(),
            },
          },
          context,
          configuration
        );
        break;
      case "coupon.deleted":
        billingDispatchTyped(
          {
            op: "deleteById",
            table: "convex_billing_coupons",
            idField: "couponId",
            idValue: couponId,
          },
          context,
          configuration
        );
        break;
    }
  },
});
