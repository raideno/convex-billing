import { PriceStripeToConvex } from "@/schema/price";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export const PricesWebhooksHandler = defineWebhookHandler({
  events: ["price.created", "price.updated", "price.deleted"],
  handle: async (event, context, configuration) => {
    const price = event.data.object;

    switch (event.type) {
      case "price.created":
      case "price.updated":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "convex_stripe_prices",
            idField: "priceId",
            data: {
              priceId: price.id,
              stripe: PriceStripeToConvex(price),
              last_synced_at: Date.now(),
            },
          },
          context,
          configuration
        );
        break;
      // TODO: careful here as the deletion is just a soft delete in Stripe
      // so maybe we want to keep the record and just mark it as deleted?
      case "price.deleted":
        storeDispatchTyped(
          {
            operation: "deleteById",
            table: "convex_stripe_prices",
            idField: "priceId",
            idValue: price.id,
          },
          context,
          configuration
        );
        break;
    }
  },
});
