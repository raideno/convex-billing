import { ProductStripeToConvex } from "@/schema/product";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export const ProductsWebhooksHandler = defineWebhookHandler({
  events: ["product.created", "product.updated", "product.deleted"],
  handle: async (event, context, configuration) => {
    const product = event.data.object;

    switch (event.type) {
      case "product.created":
      case "product.updated":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "convex_stripe_products",
            idField: "productId",
            data: {
              productId: product.id,
              stripe: ProductStripeToConvex(product),
              last_synced_at: Date.now(),
            },
          },
          context,
          configuration
        );
        break;
      // TODO: careful here as the deletion is just a soft delete in Stripe
      // so maybe we want to keep the record and just mark it as deleted?
      case "product.deleted":
        storeDispatchTyped(
          {
            operation: "deleteById",
            table: "convex_stripe_products",
            idField: "productId",
            idValue: product.id,
          },
          context,
          configuration
        );
        break;
    }
  },
});
