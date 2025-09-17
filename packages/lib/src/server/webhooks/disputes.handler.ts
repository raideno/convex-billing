import { DisputeStripeToConvex } from "@/schema/dispute";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: [
    "charge.dispute.created",
    "charge.dispute.updated",
    "charge.dispute.closed",
    "charge.dispute.funds_reinstated",
  ],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripe_disputes !== true) return;

    const dispute = event.data.object;

    switch (event.type) {
      case "charge.dispute.created":
      case "charge.dispute.updated":
      case "charge.dispute.closed":
      case "charge.dispute.funds_reinstated":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripe_disputes",
            idField: "disputeId",
            data: {
              disputeId: dispute.id,
              stripe: DisputeStripeToConvex(dispute),
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
