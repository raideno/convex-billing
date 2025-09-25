import { SetupIntentStripeToConvex } from "@/schema/setup-intent";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: [
    "setup_intent.canceled",
    "setup_intent.created",
    "setup_intent.requires_action",
    "setup_intent.setup_failed",
    "setup_intent.succeeded",
  ],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripeSetupIntents !== true) return;

    const setupIntent = event.data.object;

    switch (event.type) {
      case "setup_intent.canceled":
      case "setup_intent.created":
      case "setup_intent.requires_action":
      case "setup_intent.setup_failed":
      case "setup_intent.succeeded":
        if (setupIntent.id === undefined) {
          console.error("Received setup intent event with no ID, skipping");
          return;
        }

        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripeSetupIntents",
            idField: "setupIntentId",
            data: {
              setupIntentId: setupIntent.id,
              stripe: SetupIntentStripeToConvex(setupIntent),
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
