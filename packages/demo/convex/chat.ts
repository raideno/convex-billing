import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const MAX_MESSAGE_LENGTH = 320;
export const MAX_MESSAGES = 32;

export const post = mutation({
  args: { message: v.string() },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context);
    if (!userId) throw new Error("Unauthorized");

    const user = await context.db.get(userId);
    if (!user) throw new Error("User not found");

    if (args.message.length > MAX_MESSAGE_LENGTH) {
      throw new Error(
        `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`
      );
    }

    const customer = await context.db
      .query("stripeCustomers")
      .withIndex("byEntityId", (q) => q.eq("entityId", userId))
      .unique();

    let planPriceId: string | undefined = undefined;
    let planName: string | undefined = undefined;

    if (customer) {
      const subscription = await context.db
        .query("stripeSubscriptions")
        .withIndex("byCustomerId", (q) =>
          q.eq("customerId", customer.customerId)
        )
        .unique();
      if (
        subscription &&
        subscription.stripe &&
        subscription.stripe.items.data.length > 0
      ) {
        const item = subscription.stripe.items.data[0];
        if (item.price) {
          planPriceId =
            typeof item.price === "string" ? item.price : item.price.id;
        }
      }
    }

    if (planPriceId) {
      const price = await context.db
        .query("stripePrices")
        .withIndex("byPriceId", (q) => q.eq("priceId", planPriceId))
        .unique();
      if (price) {
        const product = await context.db
          .query("stripeProducts")
          .filter((q) => q.eq(q.field("productId"), price.stripe.productId))
          .unique();
        if (product) {
          planName = product.stripe.name;
        }
      }
    }

    const checkouts = await context.db
      .query("stripeCheckoutSessions")
      .filter((q) => q.eq(q.field("stripe.metadata.entityId"), userId))
      .collect();

    const successfulPayments = checkouts.filter(
      (c) => (c as any).stripe.payment_status === "paid"
    ).length;

    const username = user.name || user.email.split("@")[0] || "Unknown";

    await context.db.insert("messages", {
      userId,
      name: username,
      message: args.message,
      planPriceId,
      planName,
      successfulPayments,
    });
  },
});

export const list = query({
  args: {},
  handler: async (context) => {
    return (
      await context.db.query("messages").order("desc").take(MAX_MESSAGES)
    ).reverse();
  },
});
