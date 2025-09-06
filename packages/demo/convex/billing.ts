import { getAuthUserId } from "@convex-dev/auth/server";
import { internalConvexBilling } from "@raideno/convex-billing/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action, query } from "./_generated/server";
import configuration from "./billing.config";

export const {
  billing,
  // --- --- ---
  store,
  sync,
  // --- --- --- stripe
  portal: portal_,
  checkout: checkout_,
  setup,
} = internalConvexBilling(configuration);

export const products = query({
  args: {},
  handler: async (context) => {
    const prices = await context.db.query("convex_billing_prices").collect();
    const products = await context.db
      .query("convex_billing_products")
      .collect();

    return products.map((product) => ({
      ...product,
      prices: prices.filter(
        (price) => price.stripe.productId === product.productId
      ),
    }));
  },
});

export const subscription = query({
  args: {},
  handler: async (context) => {
    const userId = (await getAuthUserId(context)) as string;

    if (!userId) throw new Error("Unauthorized");

    const customer = await context.db
      .query("convex_billing_customers")
      .withIndex("byEntityId", (q) => q.eq("entityId", userId))
      .unique();

    if (!customer) return null;

    const subscription = await context.db
      .query("convex_billing_subscriptions")
      .withIndex("byCustomerId", (q) => q.eq("customerId", customer.customerId))
      .unique();

    return subscription || null;
  },
});

export const checkout = action({
  args: {
    priceId: v.string(),
  },
  handler: async (
    context,
    args
  ): Promise<{
    url: string | null;
  }> => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    return await context.runAction(internal.billing.checkout_, {
      entityId: userId,
      priceId: args.priceId,
      successUrl: `${process.env.SITE_URL}/?return-from-checkout=success`,
      cancelUrl: `${process.env.SITE_URL}/?return-from-checkout=cancel`,
    });
  },
});

export const portal = action({
  args: {},
  handler: async (
    context
  ): Promise<{
    url: string | null;
  }> => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    return await context.runAction(internal.billing.portal_, {
      entityId: userId,
      returnUrl: `${process.env.SITE_URL}/?return-from-portal=success`,
    });
  },
});
