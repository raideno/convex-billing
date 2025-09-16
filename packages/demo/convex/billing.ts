import { getAuthUserId } from "@convex-dev/auth/server";
import { internalConvexBilling } from "@raideno/convex-billing/server";
import { v } from "convex/values";

import { action, query } from "./_generated/server";
import configuration from "./billing.config";

export const { billing, store, sync, setup } =
  internalConvexBilling(configuration);

export const pay = action({
  args: {
    priceId: v.string(),
  },
  handler: async (context, args): Promise<{ url: string | null }> => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    // TODO: generate a unique referenceId for the payment
    // TODO: store the referenceId as well as the associated payment_intent in a payments table
    // TODO: this way we have a list of all the payment attempts

    const orderId = "#" + Math.floor(Math.random() * 1000);

    const checkout = await billing.pay(context as any, {
      referenceId: orderId,
      entityId: userId,
      // metadata: {},
      line_items: [{ price: args.priceId, quantity: 1 }],
      success: { url: `${process.env.SITE_URL}/?return-from-checkout=success` },
      cancel: { url: `${process.env.SITE_URL}/?return-from-checkout=cancel` },
    });

    checkout.payment_intent;

    return checkout;
  },
});

export const subscribe = action({
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

    const checkout = await billing.subscribe(context as any, {
      entityId: userId,
      priceId: args.priceId,
      success: { url: `${process.env.SITE_URL}/?return-from-checkout=success` },
      cancel: { url: `${process.env.SITE_URL}/?return-from-checkout=cancel` },
    });

    return checkout;
  },
});

export const payments = query({
  args: v.object({}),
  handler: async (context) => {
    const intents = await context.db
      .query("convex_billing_payment_intents")
      .collect();

    return intents;
  },
});

export const products = query({
  args: v.object({}),
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
  args: v.object({}),
  handler: async (context) => {
    const userId = await getAuthUserId(context);

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

export const portal = action({
  args: v.object({}),
  handler: async (
    context
  ): Promise<{
    url: string | null;
  }> => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    const portal = await billing.portal(context as any, {
      entityId: userId,
      return: { url: `${process.env.SITE_URL}/?return-from-portal=success` },
    });

    return portal;
  },
});
