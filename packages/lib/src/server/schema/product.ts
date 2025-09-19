import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { metadata, nullableboolean, nullablestring } from "@/helpers";

export const ProductStripeToConvex = (product: Stripe.Product) => {
  const object: Infer<typeof ProductObject> = {
    id: product.id,
    object: product.object,
    active: product.active,
    description: product.description ?? null,
    metadata: product.metadata ?? null,
    name: product.name,
    created: product.created,
    images: product.images,
    livemode: product.livemode,
    package_dimensions: product.package_dimensions ?? null,
    shippable: product.shippable ?? null,
    statement_descriptor: product.statement_descriptor ?? null,
    unit_label: product.unit_label ?? null,
    updated: product.updated,
    url: product.url ?? null,
    marketing_features: product.marketing_features,
    default_price:
      typeof product.default_price === "string"
        ? product.default_price
        : (product.default_price?.id ?? null),
  };

  return object;
};

export const ProductSchema = {
  id: v.string(),
  object: v.string(),
  active: v.boolean(),
  description: nullablestring(),
  metadata: v.optional(v.union(metadata(), v.null())),
  name: v.string(),
  created: v.number(),
  images: v.array(v.string()),
  livemode: v.boolean(),
  package_dimensions: v.union(
    v.object({
      height: v.number(),
      length: v.number(),
      weight: v.number(),
      width: v.number(),
    }),
    v.null()
  ),
  shippable: nullableboolean(),
  statement_descriptor: v.optional(nullablestring()),
  unit_label: v.optional(nullablestring()),
  updated: v.number(),
  url: nullablestring(),
  marketing_features: v.array(
    v.object({
      name: v.optional(nullablestring()),
    })
  ),
  default_price: nullablestring(),
};

export const ProductObject = v.object(ProductSchema);
