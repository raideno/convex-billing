import { Infer } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { billingDispatchTyped } from "@/operations/helpers";
import { PriceObject } from "@/schema/price";

export const PricesSyncImplementation = defineActionImplementation({
  args: {},
  name: "prices",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localPricesRes = await billingDispatchTyped(
      {
        op: "selectAll",
        table: "convex_billing_prices",
      },
      context,
      configuration
    );
    const localPricesById = new Map(
      (localPricesRes.docs || []).map((p: any) => [p.priceId, p])
    );

    const prices = await stripe.prices
      .list({ limit: 100, expand: ["data.product"] })
      .autoPagingToArray({ limit: 10_000 });

    const stripePriceIds = new Set<string>();

    for (const price of prices) {
      stripePriceIds.add(price.id);

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
            },
            last_synced_at: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [priceId] of localPricesById.entries()) {
      if (!stripePriceIds.has(priceId)) {
        await billingDispatchTyped(
          {
            op: "deleteById",
            table: "convex_billing_prices",
            idField: "priceId",
            idValue: priceId,
          },
          context,
          configuration
        );
      }
    }
  },
});
