import { GenericActionCtx } from "convex/server";
import Stripe from "stripe";

import { billingDispatchTyped } from "@/operations/helpers";
import { BillingDataModel } from "@/schema";
import { InternalConfiguration } from "@/types";

import { WebhookHandler } from "./types";

export const ProductsWebhooksHandler: WebhookHandler = {
  events: ["product.created", "product.updated", "product.deleted"],
  handle: async (
    event: Stripe.Event,
    context: GenericActionCtx<BillingDataModel>,
    configuration: InternalConfiguration
  ) => {
    const productId = (event.data.object as { id: string }).id;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    switch (event.type) {
      case "product.created":
      case "product.updated":
        const product = await stripe.products.retrieve(productId);
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
        break;
      case "product.deleted":
        billingDispatchTyped(
          {
            op: "deleteById",
            table: "convex_billing_products",
            idField: "productId",
            idValue: productId,
          },
          context,
          configuration
        );
        break;
    }
  },
};
