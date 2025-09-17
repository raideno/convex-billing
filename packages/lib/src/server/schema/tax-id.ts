import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { nullablestring, optionalnullableobject } from "@/helpers";

export const TaxIdStripeToConvex = (taxId: Stripe.TaxId) => {
  const object: Infer<typeof TaxIdObject> = {
    id: taxId.id,
    country: taxId.country,
    customer:
      typeof taxId.customer === "string"
        ? taxId.customer
        : taxId.customer?.id || null,
    type: taxId.type,
    value: taxId.value,
    object: taxId.object,
    created: taxId.created,
    livemode: taxId.livemode,
    owner: taxId.owner
      ? {
          account:
            typeof taxId.owner.account === "string"
              ? taxId.owner.account
              : taxId.owner.account?.id || null,
          application:
            typeof taxId.owner.application === "string"
              ? taxId.owner.application
              : taxId.owner.application?.id || null,
          customer:
            typeof taxId.owner.customer === "string"
              ? taxId.owner.customer
              : taxId.owner.customer?.id || null,
          type: taxId.owner.type,
        }
      : null,
    verification: taxId.verification,
  };
  return object;
};

export const TaxIdSchema = {
  id: v.string(),
  country: v.optional(nullablestring()),
  customer: v.optional(nullablestring()),
  type: v.string(),
  value: v.string(),
  object: v.string(),
  created: v.number(),
  livemode: v.boolean(),
  owner: optionalnullableobject({
    account: v.optional(nullablestring()),
    application: v.optional(nullablestring()),
    customer: v.optional(nullablestring()),
    type: v.union(
      v.literal("account"),
      v.literal("application"),
      v.literal("customer"),
      v.literal("self")
    ),
  }),
  verification: optionalnullableobject({
    status: v.union(
      v.literal("pending"),
      v.literal("unavailable"),
      v.literal("unverified"),
      v.literal("verified")
    ),
    verified_address: v.optional(nullablestring()),
    verified_name: v.optional(nullablestring()),
  }),
};

export const TaxIdObject = v.object(TaxIdSchema);
