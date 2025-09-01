import { v } from "convex/values";

import { currencies } from "./currencies";
import { metadata, nullablenumber, nullablestring } from "./helpers";

export const PriceSchema = {
  priceId: v.string(),
  object: v.string(),
  active: v.boolean(),
  currency: currencies,
  metadata: metadata(),
  nickname: nullablestring(),
  recurring: v.union(
    v.object({
      interval: v.union(
        v.literal("day"),
        v.literal("week"),
        v.literal("month"),
        v.literal("year")
      ),
      interval_count: v.number(),
      trial_period_days: nullablenumber(),
      meter: nullablestring(),
      usage_type: v.union(v.literal("licensed"), v.literal("metered")),
    }),
    v.null()
  ),
  // NOTE: reference a product
  productId: v.string(),
  type: v.union(v.literal("one_time"), v.literal("recurring")),
  unit_amount: nullablenumber(),
  billing_scheme: v.union(v.literal("per_unit"), v.literal("tiered")),
  created: v.number(),
  livemode: v.boolean(),
  lookup_key: nullablestring(),
  tiers_mode: v.union(v.literal("graduated"), v.literal("volume"), v.null()),
  transform_quantity: v.union(
    v.object({
      divide_by: v.number(),
      round: v.union(v.literal("up"), v.literal("down")),
    }),
    v.null()
  ),
  unit_amount_decimal: nullablestring(),
  last_synced_at: v.number(),
};

export const PriceObject = v.object(PriceSchema);
