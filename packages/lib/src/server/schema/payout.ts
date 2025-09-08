import { v } from "convex/values";

import { metadata, nullablenumber, nullablestring } from "@/helpers";
import { currencies } from "@/schema/currencies";

export const PayoutSchema = {
  id: v.string(),
  amount: v.number(),
  arrival_date: v.number(),
  currency: v.optional(v.union(currencies, v.null())),
  description: v.optional(nullablestring()),
  metadata: metadata(),
  statement_descriptor: v.optional(nullablestring()),
  status: v.string(),
  object: v.string(),
  application_only: v.optional(nullablestring()),
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
      v.literal("not_applicable")
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
