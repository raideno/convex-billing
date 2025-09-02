import { Infer } from "convex/values";
import Stripe from "stripe";

import { StoreInputValidator } from "../../store";
import { StoreImplementation } from "../../types";
import { defineActionImplementation } from "../../helpers";

export const syncAllProductsImplementation = defineActionImplementation({
  args: {},
  name: "syncAllProducts",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const response = await stripe.products.list({
      limit: 100,
    });

    if (response.has_more)
      console.warn(
        "There are more than 100 products, pagination not implemented"
      );

    const products = response.data;

    await context.runMutation(configuration.store as StoreImplementation, {
      args: {
        name: "persistProducts",
        products: products,
      },
    });

    return products;
  },
});
