import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { metadata, nullablenumber, nullablestring } from "@/helpers";

export const InvoiceStripeToConvex = (
  invoice: Stripe.Invoice & { id: string }
) => {
  const object: Infer<typeof InvoiceObject> = {
    id: invoice.id,
    auto_advance: invoice.auto_advance,
    automatic_tax: invoice.automatic_tax,
    collection_method: invoice.collection_method,
    confirmation_secret: invoice.confirmation_secret,
    currency: invoice.currency,
    customer:
      typeof invoice.customer === "string"
        ? invoice.customer
        : (invoice.customer?.id ?? ""),
    description: invoice.description,
    hosted_invoice_url: invoice.hosted_invoice_url,
    lines: invoice.lines,
    metadata: invoice.metadata,
    parent: typeof invoice.parent === "string" ? invoice.parent : null,
    period_end: invoice.period_end,
    period_start: invoice.period_start,
    status: invoice.status as
      | "draft"
      | "open"
      | "paid"
      | "uncollectible"
      | "void",
    total: invoice.total ?? 0,
    object: invoice.object,
    account_country: invoice.account_country,
    account_name: invoice.account_name,
    account_tax_ids: invoice.account_tax_ids
      ? invoice.account_tax_ids.map((account_tax_id) =>
          typeof account_tax_id === "string"
            ? account_tax_id
            : account_tax_id.id
        )
      : null,
    amount_due: invoice.amount_due,
    amount_overpaid: invoice.amount_overpaid,
    amount_paid: invoice.amount_paid,
    amount_remaining: invoice.amount_remaining,
    amount_shipping: invoice.amount_shipping,
    application:
      typeof invoice.application === "string"
        ? invoice.application
        : invoice.application?.id,
    attempt_count: invoice.attempt_count,
    attempted: invoice.attempted,
    automatically_finalizes_at: invoice.automatically_finalizes_at,
    billing_reason: invoice.billing_reason,
    created: invoice.created,
    custom_fields: invoice.custom_fields,
    customer_address: invoice.customer_address,
    customer_email: invoice.customer_email,
    customer_name: invoice.customer_name,
    customer_phone: invoice.customer_phone,
    customer_shipping: invoice.customer_shipping,
    customer_tax_exempt: invoice.customer_tax_exempt,
    customer_tax_ids: invoice.customer_tax_ids,
    default_payment_method:
      typeof invoice.default_payment_method === "string"
        ? invoice.default_payment_method
        : invoice.default_payment_method?.id,
    default_source:
      typeof invoice.default_source === "string"
        ? invoice.default_source
        : invoice.default_source?.id,
    default_tax_rates: invoice.default_tax_rates,
    discounts: invoice.discounts.map((d) => (typeof d === "string" ? d : d.id)),
    due_date: invoice.due_date,
    effective_at: invoice.effective_at,
    ending_balance: invoice.ending_balance,
    footer: invoice.footer,
    from_invoice: invoice.from_invoice,
    invoice_pdf: invoice.invoice_pdf,
    issuer: invoice.issuer,
    last_finalization_error: invoice.last_finalization_error,
    latest_revision: invoice.latest_revision
      ? typeof invoice.latest_revision === "string"
        ? invoice.latest_revision
        : invoice.latest_revision?.id
      : null,
    livemode: invoice.livemode,
    next_payment_attempt: invoice.next_payment_attempt,
    number: invoice.number,
    on_behalf_of:
      typeof invoice.on_behalf_of === "string"
        ? invoice.on_behalf_of
        : invoice.on_behalf_of?.id,
    payment_settings: invoice.payment_settings,
    payments: invoice.payments,
    post_payment_credit_notes_amount: invoice.post_payment_credit_notes_amount,
    pre_payment_credit_notes_amount: invoice.pre_payment_credit_notes_amount,
    receipt_number: invoice.receipt_number,
    rendering: (invoice as any).rendering,
    shipping_cost: invoice.shipping_cost,
    shipping_details: invoice.shipping_details,
    starting_balance: invoice.starting_balance,
    statement_descriptor: invoice.statement_descriptor,
    status_transitions: invoice.status_transitions,
    subtotal: invoice.subtotal,
    subtotal_excluding_tax: invoice.subtotal_excluding_tax,
    test_clock:
      typeof invoice.test_clock === "string"
        ? invoice.test_clock
        : invoice.test_clock?.id,
    threshold_reason: invoice.threshold_reason,
    total_discount_amounts: invoice.total_discount_amounts,
    total_excluding_tax: invoice.total_excluding_tax,
    total_pretax_credit_amounts: invoice.total_pretax_credit_amounts,
    total_taxes: invoice.total_taxes,
    webhooks_delivered_at: invoice.webhooks_delivered_at,
  };

  return object;
};

export const InvoiceSchema = {
  id: v.string(),
  auto_advance: v.optional(v.boolean()),
  //   automatic_tax: v.object({
  //     // TODO: complete
  //   }),
  automatic_tax: v.any(),
  collection_method: v.union(
    v.literal("charge_automatically"),
    v.literal("send_invoice")
  ),
  //   confirmation_secret: optionalnullableobject({
  //     // TODO: complete
  //   }),
  confirmation_secret: v.any(),
  currency: v.string(),
  customer: v.string(),
  description: v.optional(nullablestring()),
  hosted_invoice_url: v.optional(nullablestring()),
  //   lines: v.object({
  //     // TODO: complete
  //   }),
  lines: v.any(),
  metadata: v.optional(v.union(metadata(), v.null())),
  //   parent: optionalnullableobject({
  //     // TODO: complete
  //   }),
  parent: v.any(),
  period_end: v.number(),
  period_start: v.number(),
  status: v.union(
    v.literal("draft"),
    v.literal("open"),
    v.literal("paid"),
    v.literal("uncollectible"),
    v.literal("void")
  ),
  total: v.number(),
  object: v.string(),
  account_country: v.optional(nullablestring()),
  account_name: v.optional(nullablestring()),
  account_tax_ids: v.optional(v.union(v.array(v.string()), v.null())),
  amount_due: v.number(),
  amount_overpaid: v.number(),
  amount_paid: v.number(),
  amount_remaining: v.number(),
  amount_shipping: v.number(),
  application: v.optional(nullablestring()),
  attempt_count: v.number(),
  attempted: v.boolean(),
  automatically_finalizes_at: v.optional(v.union(v.number(), v.null())),
  billing_reason: v.union(
    v.literal("automatic_pending_invoice_item_invoice"),
    v.literal("manual"),
    v.literal("quote_accept"),
    v.literal("subscription"),
    v.literal("subscription_create"),
    v.literal("subscription_cycle"),
    v.literal("subscription_threshold"),
    v.literal("subscription_update"),
    v.literal("upcoming"),
    v.null()
  ),
  created: v.number(),
  custom_fields: v.optional(
    v.union(
      v.array(
        // v.object({
        //   // TODO: compete
        // })
        v.any()
      ),
      v.null()
    )
  ),
  //   customer_address: optionalnullableobject({
  //     // TODO: complete
  //   }),
  customer_address: v.any(),
  customer_email: v.optional(nullablestring()),
  customer_name: v.optional(nullablestring()),
  customer_phone: v.optional(nullablestring()),
  //   customer_shipping: optionalnullableobject({
  //     // TODO: complete
  //   }),
  customer_shipping: v.any(),
  customer_tax_exempt: v.union(
    v.literal("exempt"),
    v.literal("none"),
    v.literal("reverse"),
    v.null()
  ),
  //   customer_tax_ids: v.optional(
  //     v.union(
  //       v.array(
  //         v.object({
  //           // TODO: complete
  //         })
  //       ),
  //       v.null()
  //     )
  //   ),
  customer_tax_ids: v.optional(v.union(v.array(v.any()), v.null())),
  default_payment_method: v.optional(nullablestring()),
  default_source: v.optional(nullablestring()),
  // --- --- ---
  default_tax_rates: v.array(
    // v.object({
    //   // TODO: complete
    // })
    v.any()
  ),
  discounts: v.array(v.string()),
  due_date: v.optional(nullablenumber()),
  effective_at: v.optional(nullablenumber()),
  ending_balance: v.optional(nullablenumber()),
  footer: v.optional(nullablestring()),
  //   from_invoice: optionalnullableobject({
  //     // TODO: complete
  //   }),
  from_invoice: v.any(),
  invoice_pdf: v.optional(nullablestring()),
  //   issuer: v.object({
  //     // TODO: complete
  //   }),
  issuer: v.any(),
  //   last_finalization_error: optionalnullableobject({
  //     // TODO: complete,
  //   }),
  last_finalization_error: v.any(),
  latest_revision: v.optional(nullablestring()),
  livemode: v.boolean(),
  next_payment_attempt: v.optional(nullablenumber()),
  number: v.optional(nullablestring()),
  on_behalf_of: v.optional(nullablestring()),
  //   payment_settings: v.object({
  //     // TODO: complete
  //   }),
  payment_settings: v.any(),
  //   payments: v.object({
  //     // TODO: complete
  //   }),
  payments: v.any(),
  post_payment_credit_notes_amount: v.number(),
  pre_payment_credit_notes_amount: v.number(),
  receipt_number: v.optional(nullablestring()),
  //   rendering: optionalnullableobject({
  //     // TODO: complete
  //   }),
  rendering: v.any(),
  //   shipping_cost: optionalnullableobject({
  //     // TODO: complete
  //   }),
  shipping_cost: v.any(),
  //   shipping_details: optionalnullableobject({
  //     // TODO: complete
  //   }),
  shipping_details: v.any(),
  starting_balance: v.number(),
  statement_descriptor: v.optional(nullablestring()),
  //   status_transitions: v.object({
  //     // TODO: complete
  //   }),
  status_transitions: v.any(),
  subtotal: v.number(),
  subtotal_excluding_tax: v.optional(nullablenumber()),
  test_clock: v.optional(nullablestring()),
  //   threshold_reason: optionalnullableobject({
  //     // TODO: complete
  //   }),
  threshold_reason: v.any(),
  total_discount_amounts: v.optional(
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
  total_excluding_tax: v.optional(nullablenumber()),
  total_pretax_credit_amounts: v.optional(
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
  total_taxes: v.optional(
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
  webhooks_delivered_at: v.optional(nullablenumber()),
};

export const InvoiceObject = v.object(InvoiceSchema);
