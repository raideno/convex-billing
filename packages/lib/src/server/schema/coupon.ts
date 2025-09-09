import { v } from "convex/values";

import { metadata, nullablenumber, nullablestring } from "@/helpers";
import { currencies } from "@/schema/currencies";

export const CouponSchema = {
  id: v.string(),
  amount_off: v.optional(nullablenumber()),
  currency: v.optional(v.union(currencies, v.null())),
  duration: v.union(
    v.literal("forever"),
    v.literal("once"),
    v.literal("repeating")
  ),
  metadata: metadata(),
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
