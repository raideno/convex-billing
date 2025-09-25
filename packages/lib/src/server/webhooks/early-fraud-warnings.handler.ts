import { EarlyFraudWarningStripeToConvex } from "@/schema/early-fraud-warning";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: [
    "radar.early_fraud_warning.created",
    "radar.early_fraud_warning.updated",
  ],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripeDisputes !== true) return;

    const earlyFraudWarning = event.data.object;

    switch (event.type) {
      case "radar.early_fraud_warning.created":
      case "radar.early_fraud_warning.updated":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripeEarlyFraudWarnings",
            idField: "earlyFraudWarningId",
            data: {
              earlyFraudWarningId: earlyFraudWarning.id,
              stripe: EarlyFraudWarningStripeToConvex(earlyFraudWarning),
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
