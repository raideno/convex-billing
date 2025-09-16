import { RefundStripeToConvex } from "@/schema/refund";
import { billingDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export const RefundsWebhooksHandler = defineWebhookHandler({
  events: ["refund.created", "refund.failed", "refund.updated"],
  handle: async (event, context, configuration) => {
    const refund = event.data.object;

    switch (event.type) {
      case "refund.created":
      case "refund.updated":
      case "refund.failed":
        await billingDispatchTyped(
          {
            operation: "upsert",
            table: "convex_billing_refunds",
            idField: "refundId",
            data: {
              refundId: refund.id,
              stripe: RefundStripeToConvex(refund),
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
