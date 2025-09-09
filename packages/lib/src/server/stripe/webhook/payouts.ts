import { Infer } from "convex/values";
import Stripe from "stripe";

import { billingDispatchTyped } from "@/operations/helpers";
import { PayoutSchema } from "@/schema/payout";

import { defineWebhookHandler } from "./types";

export const PayoutsWebhooksHandler = defineWebhookHandler({
  events: [
    "payout.canceled",
    "payout.created",
    "payout.failed",
    "payout.paid",
    "payout.reconciliation_completed",
    "payout.updated",
  ],
  handle: async (event, context, configuration) => {
    const payoutId = event.data.object.id;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    switch (event.type) {
      case "payout.updated":
      case "payout.canceled":
      case "payout.created":
      case "payout.failed":
      case "payout.paid":
      case "payout.reconciliation_completed":
        const payout = await stripe.payouts.retrieve(payoutId);
        await billingDispatchTyped(
          {
            op: "upsert",
            table: "convex_billing_payouts",
            idField: "payoutId",
            data: {
              payoutId: payout.id,
              stripe: {
                ...payout,
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
                  (payout.currency as Infer<
                    (typeof PayoutSchema)["currency"]
                  >) || undefined,
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
