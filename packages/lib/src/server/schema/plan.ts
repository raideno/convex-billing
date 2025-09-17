import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { metadata, nullablenumber, nullablestring } from "@/helpers";

export const PlanStripeToConvex = (plan: Stripe.Plan) => {
  const object: Infer<typeof PlanObject> = {
    id: plan.id,
    active: plan.active,
    amount: plan.amount,
    currency: plan.currency,
    interval: plan.interval,
    metadata: plan.metadata,
    nickname: plan.nickname,
    product: typeof plan.product === "string" ? plan.product : null,
    object: plan.object,
    amount_decimal: plan.amount_decimal,
    billing_scheme: plan.billing_scheme,
    created: plan.created,
    interval_count: plan.interval_count,
    livemode: plan.livemode,
    meter: plan.meter,
    tiers: plan.tiers,
    tiers_mode: plan.tiers_mode,
    transform_usage: plan.transform_usage,
    trial_period_days: plan.trial_period_days,
    usage_type: plan.usage_type,
  };
  return object;
};

export const PlanSchema = {
  id: v.string(),
  active: v.boolean(),
  amount: v.optional(nullablenumber()),
  currency: v.string(),
  interval: v.union(
    v.literal("day"),
    v.literal("week"),
    v.literal("month"),
    v.literal("year")
  ),
  metadata: v.optional(v.union(metadata(), v.null())),
  nickname: v.optional(nullablestring()),
  product: v.optional(nullablestring()),
  object: v.string(),
  amount_decimal: v.optional(nullablestring()),
  billing_scheme: v.union(v.literal("per_unit"), v.literal("tiered")),
  created: v.number(),
  interval_count: v.number(),
  livemode: v.boolean(),
  meter: v.optional(nullablestring()),
  // tiers: v.optional(v.union(v.array(v.object({
  //     // TODO: complete
  // })), v.null())),
  tiers: v.optional(v.union(v.array(v.any()), v.null())),
  tiers_mode: v.optional(
    v.union(v.literal("graduated"), v.literal("volume"), v.null())
  ),
  transform_usage: v.optional(
    v.union(
      v.object({
        divide_by: v.number(),
        round: v.union(v.literal("up"), v.literal("down")),
      }),
      v.null()
    )
  ),
  trial_period_days: v.optional(nullablenumber()),
  usage_type: v.string(),
};

export const PlanObject = v.object(PlanSchema);
