import { v } from "convex/values";

import { metadata, nullableboolean, nullablestring } from "./helpers";

export const ProductSchema = {
  productId: v.string(),
  object: v.string(),
  active: v.boolean(),
  description: nullablestring(),
  metadata: metadata(),
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
  statement_descriptor: nullablestring(),
  unit_label: nullablestring(),
  updated: v.number(),
  url: nullablestring(),
  marketing_features: v.array(
    v.object({
      name: v.optional(nullablestring()),
    })
  ),
  default_price: nullablestring(),
  last_synced_at: v.number(),
};

export const ProductObject = v.object(ProductSchema);
