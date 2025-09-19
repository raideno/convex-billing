import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { metadata, nullablenumber, nullablestring } from "@/helpers";

export const PayoutStripeToConvex = (payout: Stripe.Payout) => {
  const object: Infer<typeof PayoutObject> = {
    id: payout.id,
    amount: payout.amount,
    arrival_date: payout.arrival_date,
    application_fee:
      typeof payout.application_fee === "string"
        ? payout.application_fee
        : payout.application_fee?.id || null,
    application_fee_amount: payout.application_fee_amount ?? null,
    automatic: payout.automatic,
    created: payout.created,
    description: payout.description ?? null,
    failure_code: payout.failure_code ?? null,
    failure_message: payout.failure_message ?? null,
    livemode: payout.livemode,
    metadata: payout.metadata,
    method: payout.method,
    object: payout.object,
    payout_method: payout.payout_method ?? null,
    reconciliation_status: payout.reconciliation_status,
    source_type: payout.source_type,
    status: payout.status,
    trace_id: payout.trace_id,
    type: payout.type,
    original_payout:
      typeof payout.original_payout === "string"
        ? payout.original_payout
        : payout.original_payout?.id || null,
    reversed_by:
      typeof payout.reversed_by === "string"
        ? payout.reversed_by
        : payout.reversed_by?.id || null,
    destination:
      typeof payout.destination === "string"
        ? payout.destination
        : payout.destination?.id || null,
    balance_transaction:
      typeof payout.balance_transaction === "string"
        ? payout.balance_transaction
        : payout.balance_transaction?.id || null,
    failure_balance_transaction:
      typeof payout.failure_balance_transaction === "string"
        ? payout.failure_balance_transaction
        : payout.failure_balance_transaction?.id || null,
    currency:
      (payout.currency as Infer<(typeof PayoutSchema)["currency"]>) ||
      undefined,
  };
  return object;
};

export const PayoutSchema = {
  id: v.string(),
  amount: v.number(),
  arrival_date: v.number(),
  // currency: v.optional(v.union(currencies, v.null())),
  currency: v.optional(v.union(v.string(), v.null())),
  description: v.optional(nullablestring()),
  metadata: v.optional(v.union(metadata(), v.null())),
  statement_descriptor: v.optional(nullablestring()),
  status: v.string(),
  object: v.string(),
  application_fee: v.optional(nullablestring()),
  application_fee_amount: v.optional(nullablenumber()),
  automatic: v.boolean(),
  balance_transaction: v.optional(nullablestring()),
  created: v.number(),
  destination: v.optional(nullablestring()),
  failure_balance_transaction: v.optional(nullablestring()),
  failure_code: v.optional(
    v.union(
      v.literal("account_closed"),
      v.literal("account_frozen"),
      v.literal("bank_account_restricted"),
      v.literal("bank_ownership_changed"),
      v.literal("could_not_process"),
      v.literal("debit_not_authorized"),
      v.literal("declined"),
      v.literal("incorrect_account_holder_address"),
      v.literal("incorrect_account_holder_name"),
      v.literal("incorrect_account_holder_tax_id"),
      v.literal("incorrect_account_type"),
      v.literal("insufficient_funds"),
      v.literal("invalid_account_number"),
      v.literal("invalid_account_number_length"),
      v.literal("invalid_currency"),
      v.literal("no_account"),
      v.literal("unsupported_card"),
      v.string(),
      v.null()
    )
  ),
  failure_message: v.optional(nullablestring()),
  livemode: v.boolean(),
  method: v.string(),
  original_payout: v.optional(nullablestring()),
  payout_method: v.optional(nullablestring()),
  reconciliation_status: v.optional(
    v.union(
      v.literal("completed"),
      v.literal("in_progress"),
      v.literal("not_applicable"),
      v.null()
    )
  ),
  reversed_by: v.optional(nullablestring()),
  source_type: v.string(),
  trace_id: v.optional(
    v.union(
      v.null(),
      v.object({
        status: v.string(),
        value: v.optional(nullablestring()),
      })
    )
  ),
  type: v.union(v.literal("bank_account"), v.literal("card")),
};

export const PayoutObject = v.object(PayoutSchema);
