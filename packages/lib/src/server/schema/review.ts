import { Infer, v } from "convex/values";
import Stripe from "stripe";

import {
  nullablenumber,
  nullablestring,
  optionalnullableobject,
} from "@/helpers";

export const ReviewStripeToConvex = (review: Stripe.Review) => {
  const object: Infer<typeof ReviewObject> = {
    id: review.id,
    charge:
      typeof review.charge === "string"
        ? review.charge
        : review.charge?.id || null,
    open: review.open,
    payment_intent:
      typeof review.payment_intent === "string"
        ? review.payment_intent
        : review.payment_intent?.id || null,
    reason: review.reason,
    object: review.object,
    billing_zip: review.billing_zip || null,
    closed_reason: review.closed_reason || null,
    created: review.created,
    ip_address: review.ip_address || null,
    ip_address_location: review.ip_address_location,
    livemode: review.livemode,
    opened_reason: review.opened_reason,
    session: review.session || null,
  };
  return object;
};

export const ReviewSchema = {
  id: v.string(),
  charge: v.optional(nullablestring()),
  open: v.boolean(),
  payment_intent: v.optional(nullablestring()),
  reason: v.string(),
  object: v.string(),
  billing_zip: v.optional(nullablestring()),
  closed_reason: v.optional(
    v.union(
      v.literal("approved"),
      v.literal("refunded"),
      v.literal("refunded_as_fraud"),
      v.literal("disputed"),
      v.literal("redacted"),
      v.literal("canceled"),
      v.literal("payment_never_settled"),
      v.literal("acknowledged"),
      v.null()
    )
  ),
  created: v.number(),
  ip_address: v.optional(nullablestring()),
  ip_address_location: optionalnullableobject({
    city: v.optional(nullablestring()),
    country: v.optional(nullablestring()),
    latitude: v.optional(nullablenumber()),
    longitude: v.optional(nullablenumber()),
    region: v.optional(nullablestring()),
  }),
  livemode: v.boolean(),
  opened_reason: v.union(v.literal("manual"), v.literal("rule")),
  session: optionalnullableobject({
    browser: v.optional(nullablestring()),
    device: v.optional(nullablestring()),
    platform: v.optional(nullablestring()),
    version: v.optional(nullablestring()),
  }),
};

export const ReviewObject = v.object(ReviewSchema);
