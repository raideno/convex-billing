import { getAuthUserId } from "@convex-dev/auth/server";
import { internalConvexStripe } from "@raideno/convex-stripe/server";
import { v } from "convex/values";

import { action, internalMutation, mutation, query } from "./_generated/server";
import configuration from "./stripe.config";
import { internal } from "./_generated/api";

export const { stripe, store, sync, setup } =
  internalConvexStripe(configuration);

export const createInternalPaymentRecord = internalMutation({
  args: {
    priceId: v.string(),
    checkoutSessionId: v.string(),
    userId: v.id("users"),
  },
  handler: async (context, args) => {
    await context.db.insert("payments", {
      priceId: args.priceId,
      userId: args.userId,
      checkoutSessionId: args.checkoutSessionId,
    });
  },
});

export const pay = action({
  args: {
    priceId: v.string(),
  },
  handler: async (context, args): Promise<{ url: string | null }> => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    // TODO: shouldn't be done this way, add entityId to it or something
    const orderId = "#" + Math.floor(Math.random() * 1000);

    const checkout = await stripe.pay(context as any, {
      referenceId: orderId,
      entityId: userId,
      // metadata: {},
      line_items: [{ price: args.priceId, quantity: 1 }],
      success: { url: `${process.env.SITE_URL}/?return-from-pay=success` },
      cancel: { url: `${process.env.SITE_URL}/?return-from-pay=cancel` },
    });

    await context.runMutation(internal.stripe.createInternalPaymentRecord, {
      priceId: args.priceId,
      checkoutSessionId: checkout.id,
      userId: userId,
    });

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

    const checkout = await stripe.subscribe(context as any, {
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
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    const checkouts = await context.db
      .query("stripeCheckoutSessions")
      .filter((query) =>
        query.eq(query.field("stripe.metadata.entityId"), userId)
      )
      .collect();

    const payments = (
      await context.db
        .query("payments")
        .withIndex("byUserId", (q) => q.eq("userId", userId))
        .collect()
    ).map((payment) => ({
      ...payment,
      checkout:
        checkouts.find(
          (checkout) => checkout.checkoutSessionId === payment.checkoutSessionId
        ) || null,
    }));

    return payments;
  },
});

export const products = query({
  args: v.object({}),
  handler: async (context) => {
    const prices = await context.db.query("stripePrices").collect();
    const products = await context.db.query("stripeProducts").collect();

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
      .query("stripeCustomers")
      .withIndex("byEntityId", (q) => q.eq("entityId", userId))
      .unique();

    if (!customer) return null;

    const subscription = await context.db
      .query("stripeSubscriptions")
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

    const portal = await stripe.portal(context as any, {
      entityId: userId,
      return: { url: `${process.env.SITE_URL}/?return-from-portal=success` },
    });

    return portal;
  },
});
