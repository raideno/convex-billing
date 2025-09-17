import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { metadata, nullablenumber, nullablestring } from "@/helpers";

export const CustomerStripeToConvex = (customer: Stripe.Customer) => {
  const object: Infer<typeof CustomerObject> = {
    ...customer,
    default_source:
      typeof customer.default_source === "string"
        ? customer.default_source
        : customer.default_source?.id,
    test_clock:
      typeof customer.test_clock === "string"
        ? customer.test_clock
        : customer.test_clock?.id,
  };
  return object;
};

export const AddressSchema = {
  city: v.optional(nullablestring()),
  country: v.optional(nullablestring()),
  line1: v.optional(nullablestring()),
  line2: v.optional(nullablestring()),
  postal_code: v.optional(nullablestring()),
  state: v.optional(nullablestring()),
};

export const CustomerSchema = {
  id: v.string(),
  address: v.optional(v.union(v.object(AddressSchema), v.null())),
  description: v.optional(nullablestring()),
  email: v.optional(nullablestring()),
  metadata: v.optional(v.union(metadata(), v.null())),
  name: v.optional(nullablestring()),
  phone: v.optional(nullablestring()),
  shipping: v.optional(
    v.union(
      v.object({
        address: v.optional(v.object(AddressSchema)),
        name: v.optional(v.string()),
        phone: v.optional(nullablestring()),
        carrier: v.optional(nullablestring()),
        tracking_number: v.optional(nullablestring()),
      }),
      v.null()
    )
  ),
  tax: v.optional(
    v.object({
      automatic_tax: v.union(
        v.literal("failed"),
        v.literal("not_collecting"),
        v.literal("supported"),
        v.literal("unrecognized_location")
      ),
      ip_address: v.optional(nullablestring()),
      location: v.union(
        v.object({
          country: v.string(),
          source: v.string(),
          state: v.optional(nullablestring()),
        }),
        v.null()
      ),
    })
  ),

  object: v.string(),
  balance: v.number(),
  cash_balance: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  created: v.number(),
  // currency: v.optional(v.union(currencies, v.string(), v.null())),
  currency: v.optional(v.union(v.string(), v.null())),
  default_source: v.optional(nullablestring()),
  delinquent: v.optional(v.union(v.boolean(), v.null())),
  discount: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  invoice_credit_balance: v.optional(
    // v.object({
    //   // TODO: complete
    // })
    v.any()
  ),
  invoice_prefix: v.optional(nullablestring()),
  // invoice_settings: v.object({
  //   // TODO: complete
  // }),
  invoice_settings: v.optional(v.any()),
  livemode: v.boolean(),
  next_invoice_sequence: v.optional(nullablenumber()),
  preferred_locales: v.optional(v.union(v.array(v.string()), v.null())),
  sources: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  subscriptions: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  tax_exempt: v.optional(
    v.union(
      v.literal("exempt"),
      v.literal("none"),
      v.literal("reverse"),
      v.null()
    )
  ),
  tax_ids: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  test_clock: v.optional(nullablestring()),
};

export const CustomerObject = v.object(CustomerSchema);
