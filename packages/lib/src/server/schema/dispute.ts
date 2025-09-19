import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { metadata, nullablestring } from "@/helpers";

export const DisputeStripeToConvex = (dispute: Stripe.Dispute) => {
  const object: Infer<typeof DisputeObject> = {
    id: dispute.id,
    amount: dispute.amount,
    charge:
      typeof dispute.charge === "string" ? dispute.charge : dispute.charge.id,
    currency: dispute.currency,
    evidence: dispute.evidence,
    metadata: dispute.metadata,
    payment_intent:
      typeof dispute.payment_intent === "string"
        ? dispute.payment_intent
        : dispute.payment_intent?.id || null,
    reason: dispute.reason,
    status: dispute.status,
    object: dispute.object,
    balance_transactions: dispute.balance_transactions.map((bt) =>
      typeof bt === "string" ? bt : bt.id
    ),
    created: dispute.created,
    enhanced_eligibility_types: dispute.enhanced_eligibility_types,
    evidence_details: dispute.evidence_details,
    is_charge_refundable: dispute.is_charge_refundable,
    livemode: dispute.livemode,
    payment_method_details: dispute.payment_method_details,
  };
  return object;
};

export const DisputeSchema = {
  id: v.string(),
  amount: v.number(),
  charge: v.string(),
  currency: v.string(),
  // evidence: v.object({
  //     // TODO: complete
  // }),
  evidence: v.any(),
  metadata: v.optional(v.union(metadata(), v.null())),
  payment_intent: v.optional(nullablestring()),
  reason: v.string(),
  status: v.union(
    v.literal("lost"),
    v.literal("needs_response"),
    v.literal("prevented"),
    v.literal("under_review"),
    v.literal("warning_closed"),
    v.literal("warning_needs_response"),
    v.literal("warning_under_review"),
    v.literal("won")
  ),
  object: v.string(),
  //   balance_transactions: v.array(v.object({
  //     // TODO: complete
  //   })),
  balance_transactions: v.array(v.any()),
  created: v.number(),
  enhanced_eligibility_types: v.array(
    v.union(
      v.literal("visa_compelling_evidence_3"),
      v.literal("visa_compliance")
    )
  ),
  //   evidence_details: v.object({
  //     // TODO: complete
  //   }),
  evidence_details: v.any(),
  is_charge_refundable: v.boolean(),
  livemode: v.boolean(),
  // payment_method_details: optionalnullableobject({
  //     // TODO: complete
  // }),
  payment_method_details: v.optional(v.any()),
};

export const DisputeObject = v.object(DisputeSchema);
