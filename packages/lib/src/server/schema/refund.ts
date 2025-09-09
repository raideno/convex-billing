import { v } from "convex/values";

import { metadata, nullablestring } from "@/helpers";
import { currencies } from "@/schema/currencies";

export const RefundSchema = {
  id: v.string(),
  amount: v.number(),
  charge: v.optional(nullablestring()),
  currency: v.union(currencies, v.string()),
  description: v.optional(nullablestring()),
  metadata: metadata(),
  payment_intent: v.optional(nullablestring()),
  reason: v.optional(nullablestring()),
  status: v.optional(nullablestring()),
  object: v.string(),
  balance_transaction: v.optional(nullablestring()),
  created: v.number(),
  destination_details: v.optional(
    v.union(
      v.any(),
      v.object({
        // TODO: complete
      }),
      v.null()
    )
  ),
  failure_balance_transaction: v.optional(nullablestring()),
  failure_reason: v.optional(nullablestring()),
  instructions_email: v.optional(nullablestring()),
  next_action: v.optional(
    v.union(
      v.any(),
      v.object({
        // TODO: complete
      }),
      v.null()
    )
  ),
  pending_reason: v.optional(nullablestring()),
  receipt_number: v.optional(nullablestring()),
  source_transfer_reversal: v.optional(nullablestring()),
  transfer_reversal: v.optional(nullablestring()),
};

export const RefundObject = v.object(RefundSchema);
