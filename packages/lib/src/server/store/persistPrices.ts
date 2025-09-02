import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { PriceObject } from "../schema/price";
import { defineMutationImplementation } from "../helpers";

export const persistPrices = defineMutationImplementation({
  name: "persistPrices",
  args: {
    prices: v.any(),
  },
  handler: async (context, args, configuration) => {
    const prices = args.prices as Stripe.Price[];

    const existingPrices = await context.db
      .query("convex_billing_prices")
      .collect();
    for (const p of existingPrices) {
      await context.db.delete(p._id);
    }

    for (const price of prices) {
      const priceObj: Infer<typeof PriceObject> = {
        priceId: price.id,
        object: price.object,
        active: price.active,
        currency: price.currency as Infer<typeof PriceObject>["currency"],
        metadata: price.metadata || {},
        nickname: price.nickname,
        recurring: price.recurring,
        productId:
          typeof price.product === "string" ? price.product : price.product.id,
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
      };
    }
  },
});
