import { CustomerStripeToConvex } from "@/schema/customer";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export const CustomersWebhookHandler = defineWebhookHandler({
  events: ["customer.created", "customer.updated", "customer.deleted"],
  handle: async (event, context, configuration) => {
    const customer = event.data.object;
    const entityId = customer.metadata.entityId;

    switch (event.type) {
      case "customer.created":
      case "customer.updated":
        if (!entityId)
          configuration.logger.warn(
            "No entityId associated with newly created customer."
          );
        else
          await storeDispatchTyped(
            {
              operation: "upsert",
              table: "convex_stripe_customers",
              idField: "entityId",
              data: {
                customerId: customer.id,
                entityId: entityId,
                stripe: CustomerStripeToConvex(customer),
                last_synced_at: Date.now(),
              },
            },
            context,
            configuration
          );
        break;
      case "customer.deleted":
        storeDispatchTyped(
          {
            operation: "deleteById",
            table: "convex_stripe_customers",
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
