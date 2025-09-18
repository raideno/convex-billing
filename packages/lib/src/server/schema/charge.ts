import { Infer, v } from "convex/values";
import Stripe from "stripe";

import {
  metadata,
  nullablenumber,
  nullablestring,
  optionalnullableobject,
} from "@/helpers";

export const ChargeStripeToConvex = (charge: Stripe.Charge) => {
  const object: Infer<typeof ChargeObject> = {
    id: charge.id,
    amount: charge.amount,
    balance_transaction:
      typeof charge.balance_transaction === "string"
        ? charge.balance_transaction
        : (charge.balance_transaction?.id ?? null),
    billing_details: charge.billing_details,
    currency: charge.currency,
    customer:
      typeof charge.customer === "string"
        ? charge.customer
        : (charge.customer?.id ?? null),
    description: charge.description ?? null,
    disputed: charge.disputed,
    metadata: charge.metadata,
    payment_intent:
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : (charge.payment_intent?.id ?? null),
    payment_method_details: charge.payment_method_details,
    receipt_email: charge.receipt_email ?? null,
    refunded: charge.refunded,
    shipping: charge.shipping ?? null,
    statement_descriptor: charge.statement_descriptor ?? null,
    statement_descriptor_suffix: charge.statement_descriptor_suffix ?? null,
    status: charge.status,
    object: charge.object,
    amount_captured: charge.amount_captured,
    amount_refunded: charge.amount_refunded,
    application:
      typeof charge.application === "string"
        ? charge.application
        : (charge.application?.id ?? null),
    application_fee:
      typeof charge.application_fee === "string"
        ? charge.application_fee
        : (charge.application_fee?.id ?? null),
    application_fee_amount: charge.application_fee_amount ?? null,
    calculated_statement_descriptor:
      charge.calculated_statement_descriptor ?? null,
    captured: charge.captured,
    created: charge.created,
    failure_balance_transaction:
      typeof charge.failure_balance_transaction === "string"
        ? charge.failure_balance_transaction
        : (charge.failure_balance_transaction?.id ?? null),
    failure_code: charge.failure_code ?? null,
    failure_message: charge.failure_message ?? null,
    fraud_details: charge.fraud_details,
    livemode: charge.livemode,
    on_behalf_of:
      typeof charge.on_behalf_of === "string"
        ? charge.on_behalf_of
        : (charge.on_behalf_of?.id ?? null),
    outcome: charge.outcome,
    paid: charge.paid,
    payment_method: charge.payment_method,
    presentment_details: charge.presentment_details,
    radar_options: charge.radar_options,
    receipt_number: charge.receipt_number ?? null,
    receipt_url: charge.receipt_url ?? null,
    refunds: charge.refunds,
    review:
      typeof charge.review === "string"
        ? charge.review
        : (charge.review?.id ?? null),
    source_transfer:
      typeof charge.source_transfer === "string"
        ? charge.source_transfer
        : (charge.source_transfer?.id ?? null),
    transfer:
      typeof charge.transfer === "string"
        ? charge.transfer
        : (charge.transfer?.id ?? null),
    transfer_data: charge.transfer_data,
    transfer_group: charge.transfer_group ?? null,
  };
  return object;
};

export const ChargeSchema = {
  id: v.string(),
  amount: v.number(),
  balance_transaction: v.optional(nullablestring()),
  billing_details: v.object({
    address: optionalnullableobject({
      city: v.optional(nullablestring()),
      country: v.optional(nullablestring()),
      line1: v.optional(nullablestring()),
      line2: v.optional(nullablestring()),
      postal_code: v.optional(nullablestring()),
      state: v.optional(nullablestring()),
    }),
    email: v.optional(nullablestring()),
    name: v.optional(nullablestring()),
    phone: v.optional(nullablestring()),
    tax_id: v.optional(nullablestring()),
  }),
  currency: v.string(),
  customer: v.optional(nullablestring()),
  description: v.optional(nullablestring()),
  disputed: v.boolean(),
  metadata: v.optional(v.union(metadata(), v.null())),
  payment_intent: v.optional(nullablestring()),
  // payment_method_details: optionalnullableobject({
  //     // TODO: complete
  // }),
  payment_method_details: v.any(),
  receipt_email: v.optional(nullablestring()),
  refunded: v.boolean(),
  // shipping: optionalnullableobject({
  //     // TODO: complete
  // }),
  shipping: v.any(),
  statement_descriptor: v.optional(nullablestring()),
  statement_descriptor_suffix: v.optional(nullablestring()),
  status: v.union(
    v.literal("succeeded"),
    v.literal("failed"),
    v.literal("pending")
  ),
  object: v.string(),
  amount_captured: v.number(),
  amount_refunded: v.number(),
  application: v.optional(nullablestring()),
  application_fee: v.optional(nullablestring()),
  application_fee_amount: v.optional(nullablenumber()),
  calculated_statement_descriptor: v.optional(nullablestring()),
  captured: v.boolean(),
  created: v.number(),
  failure_balance_transaction: v.optional(nullablestring()),
  failure_code: v.optional(nullablestring()),
  failure_message: v.optional(nullablestring()),
  // fraud_details: optionalnullableobject({
  //     // TODO: complete
  // }),
  fraud_details: v.any(),
  livemode: v.boolean(),
  on_behalf_of: v.optional(nullablestring()),
  // outcome: optionalnullableobject({
  //     // TODO: complete
  // }),
  outcome: v.any(),
  paid: v.boolean(),
  payment_method: v.optional(nullablestring()),
  // presentment_details: optionalnullableobject({
  //     // TODO: complete
  // }),
  presentment_details: v.any(),
  // radar_options: optionalnullableobject({
  //     // TODO: complete
  // }),
  radar_options: v.any(),
  receipt_number: v.optional(nullablestring()),
  receipt_url: v.optional(nullablestring()),
  // refunds: optionalnullableobject({
  //     // TODO: complete
  // }),
  refunds: v.any(),
  review: v.optional(nullablestring()),
  source_transfer: v.optional(nullablestring()),
  transfer: v.optional(nullablestring()),
  // transfer_data: optionalnullableobject({
  //     // TODO: complete
  // }),
  transfer_data: v.any(),
  // transfer_group: optionalnullableobject({
  //     // TODO: complete
  // }),
  transfer_group: v.any(),
};

export const ChargeObject = v.object(ChargeSchema);
