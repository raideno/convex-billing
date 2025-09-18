import { metadata, nullablenumber, nullablestring } from "@/helpers";
import { Infer, v } from "convex/values";
import Stripe from "stripe";

export const CreditNoteStripeToConvex = (creditNote: Stripe.CreditNote) => {
  const object: Infer<typeof CreditNoteObject> = {
    id: creditNote.id,
    amount: creditNote.amount,
    amount_shipping: creditNote.amount_shipping,
    created: creditNote.created,
    currency: creditNote.currency,
    customer:
      typeof creditNote.customer === "string"
        ? creditNote.customer
        : creditNote.customer
          ? creditNote.customer.id
          : null,
    customer_balance_transaction:
      typeof creditNote.customer_balance_transaction === "string"
        ? creditNote.customer_balance_transaction
        : creditNote.customer_balance_transaction
          ? creditNote.customer_balance_transaction.id
          : null,
    discount_amount: creditNote.discount_amount,
    discount_amounts: creditNote.discount_amounts.map((da) => ({
      amount: da.amount,
      discount: typeof da.discount === "string" ? da.discount : da.discount.id,
    })),
    effective_at: creditNote.effective_at ?? null,
    invoice:
      typeof creditNote.invoice === "string"
        ? creditNote.invoice
        : (creditNote.invoice.id ?? null),
    lines: creditNote.lines,
    livemode: creditNote.livemode,
    memo: creditNote.memo ?? null,
    metadata: creditNote.metadata,
    number: creditNote.number,
    object: creditNote.object,
    out_of_band_amount: creditNote.out_of_band_amount ?? null,
    pdf: creditNote.pdf,
    post_payment_amount: creditNote.post_payment_amount,
    pre_payment_amount: creditNote.pre_payment_amount,
    pretax_credit_amounts: creditNote.pretax_credit_amounts.map((pca) => ({
      amount: pca.amount,
      credit_balance_transaction:
        typeof pca.credit_balance_transaction === "string"
          ? pca.credit_balance_transaction
          : pca.credit_balance_transaction
            ? pca.credit_balance_transaction.id
            : null,
      discount:
        typeof pca.discount === "string"
          ? pca.discount
          : pca.discount
            ? pca.discount.id
            : null,
      type: pca.type,
    })),
    reason: creditNote.reason,
    refunds: creditNote.refunds.map((r) => ({
      amount_refunded: r.amount_refunded,
      refund: typeof r.refund === "string" ? r.refund : r.refund.id,
    })),
    shipping_cost: creditNote.shipping_cost,
    subtotal_excluding_tax: creditNote.subtotal_excluding_tax ?? null,
    total_excluding_tax: creditNote.total_excluding_tax ?? null,
    total: creditNote.total,
    total_taxes: creditNote.total_taxes,
    type: creditNote.type,
    voided_at: creditNote.voided_at ?? null,
    status: creditNote.status,
    subtotal: creditNote.subtotal,
  };
  return object;
};

export const CreditNoteSchema = {
  id: v.string(),
  currency: v.string(),
  invoice: v.optional(nullablestring()),
  //   lines: v.object({
  //     // TODO: complete
  //   }),
  lines: v.any(),
  memo: v.optional(nullablestring()),
  metadata: v.optional(v.union(metadata(), v.null())),
  reason: v.union(
    v.literal("duplicate"),
    v.literal("fraudulent"),
    v.literal("order_change"),
    v.literal("product_unsatisfactory"),
    v.null()
  ),
  status: v.union(v.literal("issued"), v.literal("void")),
  subtotal: v.number(),
  total: v.number(),
  object: v.string(),
  amount: v.number(),
  amount_shipping: v.number(),
  created: v.number(),
  customer: v.optional(nullablestring()),
  customer_balance_transaction: v.optional(nullablestring()),
  discount_amount: v.number(),
  discount_amounts: v.array(
    v.object({
      amount: v.number(),
      discount: v.string(),
    })
  ),
  effective_at: v.optional(nullablenumber()),
  livemode: v.boolean(),
  number: v.string(),
  out_of_band_amount: v.optional(nullablenumber()),
  pdf: v.string(),
  post_payment_amount: v.number(),
  pre_payment_amount: v.number(),
  pretax_credit_amounts: v.array(
    v.object({
      amount: v.number(),
      credit_balance_transaction: v.optional(nullablestring()),
      discount: v.optional(nullablestring()),
      type: v.union(
        v.literal("credit_balance_transaction"),
        v.literal("discount")
      ),
    })
  ),
  refunds: v.array(
    v.object({
      amount_refunded: v.number(),
      refund: v.string(),
    })
  ),
  // shipping_cost: optionalnullableobject({
  //     // TODO: complete
  // }),
  shipping_cost: v.any(),
  subtotal_excluding_tax: v.optional(nullablenumber()),
  total_excluding_tax: v.optional(nullablenumber()),
  // total_taxes: optionalnullableobject({
  //     // TODO: complete
  // }),
  total_taxes: v.any(),
  type: v.union(
    v.literal("mixed"),
    v.literal("post_payment"),
    v.literal("pre_payment")
  ),
  voided_at: v.optional(nullablenumber()),
};

export const CreditNoteObject = v.object(CreditNoteSchema);
