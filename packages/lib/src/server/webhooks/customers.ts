import { CustomerStripeToConvex } from "@/schema/customer";
import { billingDispatchTyped } from "@/store";

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
          await billingDispatchTyped(
            {
              operation: "upsert",
              table: "convex_billing_customers",
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
        billingDispatchTyped(
          {
            operation: "deleteById",
            table: "convex_billing_customers",
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
