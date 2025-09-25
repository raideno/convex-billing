import { ChargeStripeToConvex } from "@/schema/charge";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: [
    "charge.captured",
    "charge.expired",
    "charge.failed",
    "charge.pending",
    "charge.refunded",
    "charge.succeeded",
    "charge.updated",
  ],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripeCharges !== true) return;

    const charge = event.data.object;

    switch (event.type) {
      case "charge.captured":
      case "charge.expired":
      case "charge.failed":
      case "charge.pending":
      case "charge.refunded":
      case "charge.succeeded":
      case "charge.updated":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripeCharges",
            idField: "chargeId",
            data: {
              chargeId: charge.id,
              stripe: ChargeStripeToConvex(charge),
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
