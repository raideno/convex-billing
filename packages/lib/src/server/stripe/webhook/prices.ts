import { Infer } from "convex/values";
import Stripe from "stripe";

import { billingDispatchTyped } from "@/operations/helpers";
import { PriceObject } from "@/schema/price";

import { defineWebhookHandler } from "./types";

export const PricesWebhooksHandler = defineWebhookHandler({
  events: ["price.created", "price.updated", "price.deleted"],
  handle: async (event, context, configuration) => {
    const priceId = event.data.object.id;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    switch (event.type) {
      case "price.created":
      case "price.updated":
        const price = await stripe.prices.retrieve(priceId);
        await billingDispatchTyped(
          {
            op: "upsert",
            table: "convex_billing_prices",
            idField: "priceId",
            data: {
              priceId: price.id,
              stripe: {
                id: price.id,
                object: price.object,
                active: price.active,
                currency: price.currency as Infer<
                  typeof PriceObject
                >["currency"],
                metadata: price.metadata || {},
                nickname: price.nickname,
                recurring: price.recurring,
                productId:
                  typeof price.product === "string"
                    ? price.product
                    : price.product.id,
                type: price.type,
                unit_amount: price.unit_amount,
                billing_scheme: price.billing_scheme,
                created: price.created,
                livemode: price.livemode,
                lookup_key: price.lookup_key,
                tiers_mode: price.tiers_mode,
                transform_quantity: price.transform_quantity,
                unit_amount_decimal: price.unit_amount_decimal,
              },
              last_synced_at: Date.now(),
            },
          },
          context,
          configuration
        );
        break;
      case "price.deleted":
        billingDispatchTyped(
          {
            op: "deleteById",
            table: "convex_billing_prices",
            idField: "priceId",
            idValue: priceId,
          },
          context,
          configuration
        );
        break;
    }
  },
});
