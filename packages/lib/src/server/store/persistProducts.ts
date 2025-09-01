import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { define } from ".";
import { ProductObject } from "../schema/product";

export const persistProducts = define({
  type: "persistProducts",
  args: {
    products: v.any(),
  },
  handler: async (context, args, configuration) => {
    const products = args.products as Stripe.Product[];

    const existingProducts = await context.db
      .query("convex_billing_products")
      .collect();
    for (const p of existingProducts) {
      await context.db.delete(p._id);
    }

    for (const product of products) {
      const productObj: Infer<typeof ProductObject> = {
        productId: product.id,
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
        last_synced_at: Date.now(),
      };

      await context.db.insert("convex_billing_products", productObj);
    }
  },
});
