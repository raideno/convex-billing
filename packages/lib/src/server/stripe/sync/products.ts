import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { billingDispatchTyped } from "@/operations/helpers";

export const ProductsSyncImplementation = defineActionImplementation({
  args: {},
  name: "products",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localProductsResponse = await billingDispatchTyped(
      {
        op: "selectAll",
        table: "convex_billing_products",
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

      await billingDispatchTyped(
        {
          op: "upsert",
          table: "convex_billing_products",
          idField: "productId",
          data: {
            productId: product.id,
            stripe: {
              id: product.id,
              object: product.object,
              active: product.active,
              description: product.description,
              metadata: product.metadata || {},
              name: product.name,
              created: product.created,
              images: product.images,
              livemode: product.livemode,
              package_dimensions: product.package_dimensions,
              shippable: product.shippable,
              statement_descriptor: product.statement_descriptor || null,
              unit_label: product.unit_label || null,
              updated: product.updated,
              url: product.url,
              marketing_features: product.marketing_features,
              default_price:
                typeof product.default_price === "string"
                  ? product.default_price
                  : product.default_price?.id || null,
            },
            last_synced_at: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [productId, doc] of localProductsById.entries()) {
      if (!stripeProductIds.has(productId)) {
        await billingDispatchTyped(
          {
            op: "deleteById",
            table: "convex_billing_products",
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
