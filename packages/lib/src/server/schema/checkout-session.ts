import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { metadata, nullablenumber, nullablestring } from "@/helpers";

export const CheckoutSessionStripeToConvex = (
  session: Stripe.Checkout.Session
) => {
  const object: Infer<typeof CheckoutSessionObject> = {
    ...session,
    subscription:
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id || null,
    customer:
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id || null,
    line_items: Array.isArray(session.line_items)
      ? session.line_items
      : session.line_items?.data || null,
    payment_intent:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || null,
    invoice:
      typeof session.invoice === "string"
        ? session.invoice
        : session.invoice?.id || null,
    payment_link:
      typeof session.payment_link === "string"
        ? session.payment_link
        : session.payment_link?.id || null,
    setup_intent:
      typeof session.setup_intent === "string"
        ? session.setup_intent
        : session.setup_intent?.id || null,
  };
  return object;
};

export const CheckoutSessionSchema = {
  id: v.string(),
  // automatic_tax: v.object({
  //   // TODO: complete
  // }),
  automatic_tax: v.any(),
  client_reference_id: v.optional(nullablestring()),
  // currency: v.optional(v.union(currencies, v.string(), v.null())),
  currency: v.optional(v.union(v.string(), v.null())),
  customer: v.optional(nullablestring()),
  customer_email: v.optional(nullablestring()),
  line_items: v.optional(
    v.union(
      v.array(
        // v.object({
        //   // TODO: complete
        // })
        v.any()
      ),
      v.null()
    )
  ),
  metadata: v.optional(v.union(metadata(), v.null())),
  mode: v.union(
    v.literal("payment"),
    v.literal("setup"),
    v.literal("subscription")
  ),
  payment_intent: v.optional(nullablestring()),
  payment_status: v.union(
    v.literal("no_payment_required"),
    v.literal("paid"),
    v.literal("unpaid")
  ),
  return_url: v.optional(nullablestring()),
  status: v.union(
    v.literal("complete"),
    v.literal("expired"),
    v.literal("open"),
    v.null()
  ),
  success_url: v.optional(nullablestring()),
  ui_mode: v.optional(
    v.union(
      v.literal("custom"),
      v.literal("embedded"),
      v.literal("hosted"),
      v.null()
    )
  ),
  url: v.optional(nullablestring()),
  object: v.string(),
  adaptive_pricing: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  after_expiration: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  allow_promotion_codes: v.optional(v.union(v.boolean(), v.null())),
  amount_subtotal: v.optional(nullablenumber()),
  amount_total: v.optional(nullablenumber()),
  billing_address_collection: v.optional(
    v.union(v.literal("auto"), v.literal("required"), v.null())
  ),
  cancel_url: v.optional(nullablestring()),
  client_secret: v.optional(nullablestring()),
  collected_information: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  consent: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  consent_collection: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  created: v.number(),
  currency_conversion: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  custom_fields: v.array(
    // v.object({
    //   // TODO: complete
    // }),
    v.any()
  ),
  // custom_text: v.object({
  //   // TODO: complete
  // }),
  custom_text: v.any(),
  customer_creation: v.optional(
    v.union(v.literal("always"), v.literal("if_required"), v.null())
  ),
  customer_details: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  discounts: v.optional(
    v.union(
      v.array(
        // v.object({
        //   // TODO: complete
        // }),
        v.any()
      ),
      v.null()
    )
  ),
  expires_at: v.number(),
  invoice: v.optional(nullablestring()),
  invoice_creation: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  livemode: v.boolean(),
  locale: v.optional(v.union(v.string(), v.null())),
  optional_items: v.optional(
    v.union(
      v.array(
        // v.object({
        //   // TODO: complete
        // }),
        v.any()
      ),
      v.null()
    )
  ),
  origin_context: v.optional(
    v.union(v.literal("mobile_app"), v.literal("web"), v.null())
  ),
  payment_link: v.optional(nullablestring()),
  payment_method_collection: v.optional(
    v.union(v.literal("always"), v.literal("if_required"), v.null())
  ),
  payment_method_configuration_details: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  payment_method_options: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  payment_method_types: v.array(v.string()),
  permissions: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  phone_number_collection: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  presentment_details: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  recovered_from: v.optional(nullablestring()),
  redirect_on_completion: v.optional(
    v.union(
      v.literal("always"),
      v.literal("if_required"),
      v.literal("never"),
      v.null()
    )
  ),
  saved_payment_method_options: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  setup_intent: v.optional(nullablestring()),
  shipping_address_collection: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  shipping_cost: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  shipping_options: v.array(
    // v.object({
    //   // TODO: complete
    // }),
    v.any()
  ),
  submit_type: v.optional(
    v.union(
      v.literal("auto"),
      v.literal("book"),
      v.literal("donate"),
      v.literal("pay"),
      v.literal("subscribe"),
      v.null()
    )
  ),
  subscription: v.optional(nullablestring()),
  tax_id_collection: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  total_details: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
  wallet_options: v.optional(
    v.union(
      // v.object({
      //   // TODO: complete
      // }),
      v.any(),
      v.null()
    )
  ),
};

export const CheckoutSessionObject = v.object(CheckoutSessionSchema);
