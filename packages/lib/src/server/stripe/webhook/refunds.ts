import Stripe from "stripe";

import { billingDispatchTyped } from "@/operations/helpers";

import { defineWebhookHandler } from "./types";

export const RefundsWebhooksHandler = defineWebhookHandler({
  events: ["refund.created", "refund.failed", "refund.updated"],
  handle: async (event, context, configuration) => {
    const refundId = event.data.object.id;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    switch (event.type) {
      case "refund.created":
      case "refund.updated":
      case "refund.failed":
        const refund = await stripe.refunds.retrieve(refundId);
        await billingDispatchTyped(
          {
            op: "upsert",
            table: "convex_billing_refunds",
            idField: "refundId",
            data: {
              refundId: refund.id,
              stripe: {
                ...refund,
                charge:
                  typeof refund.charge === "string"
                    ? refund.charge
                    : refund.charge?.id,
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
              },
              last_synced_at: Date.now(),
            },
          },
          context,
          configuration
        );
        break;
    }
  },
});
