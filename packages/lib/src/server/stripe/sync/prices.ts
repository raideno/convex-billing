import { Infer } from "convex/values";
import Stripe from "stripe";

import { StoreInputValidator } from "../../store";
import { StoreImplementation } from "../../types";
import { defineActionImplementation } from "../../helpers";

export const syncAllPricesImplementation = defineActionImplementation({
  args: {},
  name: "syncAllPrices",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const response = await stripe.prices.list({
      limit: 100,
    });

    if (response.has_more)
      console.warn(
        "There are more than 100 prices, pagination not implemented"
      );

    const prices = response.data;

    await context.runMutation(configuration.store as StoreImplementation, {
      args: {
        name: "persistPrices",
        prices: prices,
      },
    });

    return prices;
  },
});
