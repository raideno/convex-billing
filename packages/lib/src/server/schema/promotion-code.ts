import { v } from "convex/values";

import { metadata, nullablenumber } from "@/helpers";
import { currencies } from "@/schema/currencies";

import { CouponSchema } from "./coupon";

export const PromotionCodeSchema = {
  id: v.string(),
  code: v.string(),
  coupon: v.object(CouponSchema),
  metadata: metadata(),
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
          v.union(currencies, v.string()),
          v.object({
            minimum_amount: v.optional(nullablenumber()),
          })
        ),
        v.null()
      )
    ),
    first_time_transaction: v.optional(v.boolean()),
    minimum_amount: v.optional(nullablenumber()),
    minimum_amount_currency: v.optional(
      v.union(currencies, v.string(), v.null())
    ),
  }),
  times_redeemed: v.number(),
};
