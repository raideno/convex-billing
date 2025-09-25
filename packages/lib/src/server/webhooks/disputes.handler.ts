import { DisputeStripeToConvex } from "@/schema/dispute";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: [
    "charge.dispute.created",
    "charge.dispute.updated",
    "charge.dispute.closed",
    "charge.dispute.funds_reinstated",
    "charge.dispute.funds_withdrawn",
  ],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripeDisputes !== true) return;

    const dispute = event.data.object;

    switch (event.type) {
      case "charge.dispute.funds_withdrawn":
      case "charge.dispute.created":
      case "charge.dispute.updated":
      case "charge.dispute.closed":
      case "charge.dispute.funds_reinstated":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripeDisputes",
            idField: "disputeId",
            data: {
              disputeId: dispute.id,
              stripe: DisputeStripeToConvex(dispute),
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
