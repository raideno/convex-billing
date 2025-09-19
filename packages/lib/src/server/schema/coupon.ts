import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { metadata, nullablenumber, nullablestring } from "@/helpers";

export const CouponStripeToConvex = (coupon: Stripe.Coupon) => {
  const object: Infer<typeof CouponObject> = {
    id: coupon.id,
    amount_off: coupon.amount_off ?? null,
    currency: coupon.currency ?? null,
    duration: coupon.duration,
    metadata: coupon.metadata,
    name: coupon.name ?? null,
    percent_off: coupon.percent_off ?? null,
    object: coupon.object,
    applies_to: coupon.applies_to
      ? {
          products: coupon.applies_to.products,
        }
      : null,
    created: coupon.created,
    currency_options: coupon.currency_options ?? null,
    duration_in_months: coupon.duration_in_months ?? null,
    livemode: coupon.livemode,
    max_redemptions: coupon.max_redemptions ?? null,
    redeem_by: coupon.redeem_by ?? null,
    times_redeemed: coupon.times_redeemed,
    valid: coupon.valid,
  };
  return object;
};

export const CouponSchema = {
  id: v.string(),
  amount_off: v.optional(nullablenumber()),
  // currency: v.optional(v.union(currencies, v.null())),
  currency: v.optional(v.union(v.string(), v.null())),
  duration: v.union(
    v.literal("forever"),
    v.literal("once"),
    v.literal("repeating")
  ),
  metadata: v.optional(v.union(metadata(), v.null())),
  name: v.optional(nullablestring()),
  percent_off: v.optional(nullablenumber()),
  object: v.string(),
  applies_to: v.optional(
    v.union(
      v.object({
        products: v.array(v.string()),
      }),
      v.null()
    )
  ),
  created: v.number(),
  currency_options: v.optional(
    v.union(
      v.record(
        v.string(),
        v.object({
          amount_off: v.number(),
        })
      ),
      v.null()
    )
  ),
  // @deprecated
  // If duration is repeating, the number of months the coupon applies. Null if coupon duration is forever or once.
  duration_in_months: v.optional(nullablenumber()),
  livemode: v.boolean(),
  max_redemptions: v.optional(nullablenumber()),
  // Date after which the coupon can no longer be redeemed.
  redeem_by: v.optional(nullablenumber()),
  // Number of times this coupon has been applied to a customer.
  times_redeemed: v.number(),
  valid: v.boolean(),
};

export const CouponObject = v.object(CouponSchema);
