import { CustomerStripeToConvex } from "@/schema/customer";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: ["customer.created", "customer.updated", "customer.deleted"],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripeCustomers !== true) return;

    const customer = event.data.object;
    const entityId = customer.metadata.entityId;

    switch (event.type) {
      case "customer.created":
      case "customer.updated":
        if (!entityId)
          configuration.logger.warn(
            "No entityId associated with newly created customer. Skipping..."
          );
        else
          await storeDispatchTyped(
            {
              operation: "upsert",
              table: "stripeCustomers",
              idField: "entityId",
              data: {
                customerId: customer.id,
                entityId: entityId,
                stripe: CustomerStripeToConvex(customer),
                lastSyncedAt: Date.now(),
              },
            },
            context,
            configuration
          );
        break;
      case "customer.deleted":
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripeCustomers",
            idField: "customerId",
            idValue: customer.id,
          },
          context,
          configuration
        );
        break;
    }
  },
});
