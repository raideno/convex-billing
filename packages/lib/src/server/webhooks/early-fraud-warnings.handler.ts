import { EarlyFraudWarningStripeToConvex } from "@/schema/early-fraud-warning";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: [
    "radar.early_fraud_warning.created",
    "radar.early_fraud_warning.updated",
  ],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripe_disputes !== true) return;

    const earlyFraudWarning = event.data.object;

    switch (event.type) {
      case "radar.early_fraud_warning.created":
      case "radar.early_fraud_warning.updated":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripe_early_fraud_warnings",
            idField: "earlyFraudWarningId",
            data: {
              earlyFraudWarningId: earlyFraudWarning.id,
              stripe: EarlyFraudWarningStripeToConvex(earlyFraudWarning),
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
