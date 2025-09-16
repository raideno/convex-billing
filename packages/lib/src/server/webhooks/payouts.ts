import { PayoutStripeToConvex } from "@/schema/payout";
import { billingDispatchTyped } from "@/store";

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
    const payout = event.data.object;

    switch (event.type) {
      case "payout.updated":
      case "payout.canceled":
      case "payout.created":
      case "payout.failed":
      case "payout.paid":
      case "payout.reconciliation_completed":
        await billingDispatchTyped(
          {
            operation: "upsert",
            table: "convex_billing_payouts",
            idField: "payoutId",
            data: {
              payoutId: payout.id,
              stripe: PayoutStripeToConvex(payout),
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
