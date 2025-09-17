import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { nullablestring } from "@/helpers";

export const EarlyFraudWarningStripeToConvex = (
  earlyFraudWarning: Stripe.Radar.EarlyFraudWarning
) => {
  const object: Infer<typeof EarlyFraudWarningObject> = {
    id: earlyFraudWarning.id,
    object: earlyFraudWarning.object,
    actionable: earlyFraudWarning.actionable,
    charge:
      typeof earlyFraudWarning.charge === "string"
        ? earlyFraudWarning.charge
        : earlyFraudWarning.charge.id,
    created: earlyFraudWarning.created,
    fraud_type: earlyFraudWarning.fraud_type,
    livemode: earlyFraudWarning.livemode,
    payment_intent:
      typeof earlyFraudWarning.payment_intent === "string"
        ? earlyFraudWarning.payment_intent
        : earlyFraudWarning.payment_intent?.id || null,
  };
  return object;
};

export const EarlyFraudWarningSchema = {
  id: v.string(),
  object: v.string(),
  actionable: v.boolean(),
  charge: v.string(),
  created: v.number(),
  fraud_type: v.string(),
  livemode: v.boolean(),
  payment_intent: v.optional(nullablestring()),
};

export const EarlyFraudWarningObject = v.object(EarlyFraudWarningSchema);
