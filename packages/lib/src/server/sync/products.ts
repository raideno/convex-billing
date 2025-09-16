import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { ProductStripeToConvex } from "@/schema/product";
import { storeDispatchTyped } from "@/store";

export const ProductsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "products",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localProductsResponse = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "convex_stripe_products",
      },
      context,
      configuration
    );
    const localProductsById = new Map(
      (localProductsResponse.docs || []).map((p) => [p.productId, p])
    );

    const products = await stripe.products
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripeProductIds = new Set<string>();

    for (const product of products) {
      stripeProductIds.add(product.id);

      const existing = localProductsById.get(product.id);
      if (existing && existing.stripe.updated === product.updated) {
        continue;
      }

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
    }

    for (const [productId, doc] of localProductsById.entries()) {
      if (!stripeProductIds.has(productId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "convex_stripe_products",
            idField: "productId",
            idValue: productId,
          },
          context,
          configuration
        );
      }
    }
  },
});
