import { TaxIdStripeToConvex } from "@/schema/tax-id";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: [
    "customer.tax_id.created",
    "customer.tax_id.deleted",
    "customer.tax_id.updated",
  ],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripe_tax_ids !== true) return;

    const taxId = event.data.object;

    switch (event.type) {
      case "customer.tax_id.created":
      case "customer.tax_id.deleted":
      case "customer.tax_id.updated":
        if (taxId.id === undefined) {
          console.error("Received tax id event with no ID, skipping");
          return;
        }

        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripe_tax_ids",
            idField: "taxIdId",
            data: {
              taxIdId: taxId.id,
              stripe: TaxIdStripeToConvex(taxId),
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
