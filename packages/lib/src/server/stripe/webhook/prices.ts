import { GenericActionCtx } from "convex/server";
import { Infer } from "convex/values";
import Stripe from "stripe";

import { BillingDataModel } from "../../schema";
import { PriceObject } from "../../schema/price";
import { billingDispatchTyped } from "../../operations/helpers";
import { InternalConfiguration } from "../../types";
import { WebhookHandler } from "./types";

export const PricesWebhooksHandler: WebhookHandler = {
  events: ["price.created", "price.updated", "price.deleted"],
  handle: async (
    event: Stripe.Event,
    context: GenericActionCtx<BillingDataModel>,
    configuration: InternalConfiguration
  ) => {
    const priceId = (event.data.object as { id: string }).id;

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
              object: price.object,
              active: price.active,
              currency: price.currency as Infer<typeof PriceObject>["currency"],
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
};
