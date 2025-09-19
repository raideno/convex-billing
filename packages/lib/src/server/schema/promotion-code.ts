import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { metadata, nullablenumber } from "@/helpers";

import { CouponSchema } from "./coupon";

export const PromotionCodeStripeToConvex = (
  promotionCode: Stripe.PromotionCode
) => {
  const object: Infer<typeof PromotionCodeObject> = {
    id: promotionCode.id,
    code: promotionCode.code,
    metadata: promotionCode.metadata,
    object: promotionCode.object,
    active: promotionCode.active,
    created: promotionCode.created,
    expires_at: promotionCode.expires_at ?? null,
    livemode: promotionCode.livemode,
    max_redemptions: promotionCode.max_redemptions ?? null,
    restrictions: promotionCode.restrictions,
    times_redeemed: promotionCode.times_redeemed,
    customer:
      typeof promotionCode.customer === "string"
        ? promotionCode.customer
        : promotionCode.customer?.id || null,
    coupon: promotionCode.coupon,
  };
  return object;
};

export const PromotionCodeSchema = {
  id: v.string(),
  code: v.string(),
  coupon: v.object(CouponSchema),
  metadata: v.optional(v.union(metadata(), v.null())),
  object: v.string(),
  active: v.boolean(),
  created: v.number(),
  customer: v.optional(v.union(v.string(), v.null())),
  expires_at: v.optional(nullablenumber()),
  livemode: v.boolean(),
  max_redemptions: v.optional(nullablenumber()),
  restrictions: v.object({
    currency_options: v.optional(
      v.union(
        v.record(
          v.string(),
          v.object({
            minimum_amount: v.optional(nullablenumber()),
          })
        ),
        v.null()
      )
    ),
    first_time_transaction: v.optional(v.boolean()),
    minimum_amount: v.optional(nullablenumber()),
    // minimum_amount_currency: v.optional(
    //   v.union(currencies, v.string(), v.null())
    // ),
    minimum_amount_currency: v.optional(v.union(v.string(), v.null())),
  }),
  times_redeemed: v.number(),
};

export const PromotionCodeObject = v.object(PromotionCodeSchema);
