import { RefundStripeToConvex } from "@/schema/refund";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: [
    "refund.created",
    "refund.failed",
    "refund.updated",
    "charge.refund.updated",
  ],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripeRefunds !== true) return;

    const refund = event.data.object;

    switch (event.type) {
      case "refund.created":
      case "refund.updated":
      case "refund.failed":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripeRefunds",
            idField: "refundId",
            data: {
              refundId: refund.id,
              stripe: RefundStripeToConvex(refund),
              lastSyncedAt: Date.now(),
            },
          },
          context,
          configuration
        );
        break;
    }
  },
});
