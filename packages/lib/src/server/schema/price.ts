import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { metadata, nullablenumber, nullablestring } from "../helpers";

export const PriceStripeToConvex = (price: Stripe.Price) => {
  const object: Infer<typeof PriceObject> = {
    id: price.id,
    object: price.object,
    active: price.active,
    currency: price.currency as Infer<typeof PriceObject>["currency"],
    metadata: price.metadata,
    nickname: price.nickname,
    recurring: price.recurring,
    productId:
      typeof price.product === "string" ? price.product : price.product.id,
    type: price.type,
    unit_amount: price.unit_amount,
    billing_scheme: price.billing_scheme,
    created: price.created,
    livemode: price.livemode,
    lookup_key: price.lookup_key,
    tiers_mode: price.tiers_mode,
    transform_quantity: price.transform_quantity,
    unit_amount_decimal: price.unit_amount_decimal,
  };
  return object;
};

export const PriceSchema = {
  id: v.string(),
  object: v.string(),
  active: v.boolean(),
  // currency: currencies,
  currency: v.string(),
  metadata: v.optional(v.union(metadata(), v.null())),
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
};

export const PriceObject = v.object(PriceSchema);
