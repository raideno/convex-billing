import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { metadata, nullablenumber, nullablestring } from "@/helpers";

export const CheckoutSessionStripeToConvex = (
  session: Stripe.Checkout.Session
) => {
  const object: Infer<typeof CheckoutSessionObject> = {
    id: session.id,
    automatic_tax: session.automatic_tax,
    client_reference_id: session.client_reference_id || null,
    currency: session.currency || null,
    customer_email: session.customer_email || null,
    metadata: session.metadata,
    mode: session.mode,
    payment_status: session.payment_status,
    return_url: session.return_url || null,
    status: session.status || null,
    success_url: session.success_url || null,
    ui_mode: session.ui_mode || null,
    url: session.url || null,
    object: session.object,
    adaptive_pricing: session.adaptive_pricing || null,
    after_expiration: session.after_expiration || null,
    allow_promotion_codes:
      typeof session.allow_promotion_codes === "boolean"
        ? session.allow_promotion_codes
        : null,
    amount_subtotal: session.amount_subtotal ?? null,
    amount_total: session.amount_total ?? null,
    billing_address_collection: session.billing_address_collection || null,
    cancel_url: session.cancel_url || null,
    client_secret: session.client_secret || null,
    collected_information: session.collected_information || null,
    consent: session.consent || null,
    consent_collection: session.consent_collection || null,
    created: session.created,
    currency_conversion: session.currency_conversion || null,
    custom_fields: session.custom_fields || [],
    // custom_text: session.custom_text || null,
    custom_text: session.custom_text || {},
    customer_creation: session.customer_creation || null,
    customer_details: session.customer_details || null,
    discounts: session.discounts || null,
    expires_at: session.expires_at,
    invoice_creation: session.invoice_creation || null,
    livemode: session.livemode,
    locale: session.locale || null,
    optional_items: session.optional_items || null,
    origin_context: session.origin_context || null,
    payment_method_collection: session.payment_method_collection || null,
    payment_method_configuration_details:
      session.payment_method_configuration_details || null,
    payment_method_options: session.payment_method_options || null,
    payment_method_types: session.payment_method_types,
    permissions: session.permissions || null,
    phone_number_collection: session.phone_number_collection || null,
    presentment_details: session.presentment_details || null,
    recovered_from: session.recovered_from || null,
    redirect_on_completion: session.redirect_on_completion || null,
    saved_payment_method_options: session.saved_payment_method_options || null,
    shipping_address_collection: session.shipping_address_collection || null,
    shipping_cost: session.shipping_cost || null,
    shipping_options: session.shipping_options || [],
    submit_type: session.submit_type || null,
    tax_id_collection: session.tax_id_collection || null,
    total_details: session.total_details || null,
    wallet_options: session.wallet_options || null,
    // References
    // Some of these can be expanded objects or just IDs, we store only the ID in Convex
    // see https://stripe.com/docs/api/checkout/sessions/object#checkout_session_object-customer
    // for more details
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
