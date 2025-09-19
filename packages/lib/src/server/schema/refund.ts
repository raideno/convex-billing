import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { metadata, nullablestring } from "@/helpers";

export const RefundStripeToConvex = (refund: Stripe.Refund) => {
  const object: Infer<typeof RefundObject> = {
    id: refund.id,
    amount: refund.amount,
    created: refund.created,
    currency: refund.currency,
    description: refund.description,
    failure_reason: refund.failure_reason,
    instructions_email: refund.instructions_email,
    metadata: refund.metadata,
    next_action: refund.next_action,
    object: refund.object,
    pending_reason: refund.pending_reason,
    receipt_number: refund.receipt_number,
    reason: refund.reason,
    status: refund.status,
    destination_details: refund.destination_details,
    charge:
      typeof refund.charge === "string" ? refund.charge : refund.charge?.id,
    balance_transaction:
      typeof refund.balance_transaction === "string"
        ? refund.balance_transaction
        : refund.balance_transaction?.id || null,
    failure_balance_transaction:
      typeof refund.failure_balance_transaction === "string"
        ? refund.failure_balance_transaction
        : refund.failure_balance_transaction?.id || null,
    payment_intent:
      typeof refund.payment_intent === "string"
        ? refund.payment_intent
        : refund.payment_intent?.id || null,
    source_transfer_reversal:
      typeof refund.source_transfer_reversal === "string"
        ? refund.source_transfer_reversal
        : refund.source_transfer_reversal?.id || null,
    transfer_reversal:
      typeof refund.transfer_reversal === "string"
        ? refund.transfer_reversal
        : refund.transfer_reversal?.id || null,
  };
  return object;
};

export const RefundSchema = {
  id: v.string(),
  amount: v.number(),
  charge: v.optional(nullablestring()),
  // currency: v.union(currencies, v.string()),
  currency: v.string(),
  description: v.optional(nullablestring()),
  metadata: v.optional(v.union(metadata(), v.null())),
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
