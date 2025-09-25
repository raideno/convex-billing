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
    if (configuration.sync.stripeTaxIds !== true) return;

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
            table: "stripeTaxIds",
            idField: "taxIdId",
            data: {
              taxIdId: taxId.id,
              stripe: TaxIdStripeToConvex(taxId),
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
