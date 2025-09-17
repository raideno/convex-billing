import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { PriceStripeToConvex } from "@/schema/price";
import { storeDispatchTyped } from "@/store";

export const PricesSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "prices",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripe_prices !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localPricesRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripe_prices",
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

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripe_prices",
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
    }

    for (const [priceId] of localPricesById.entries()) {
      if (!stripePriceIds.has(priceId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripe_prices",
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
