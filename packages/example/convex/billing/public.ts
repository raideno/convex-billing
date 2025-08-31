import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { STRIPE_SUB_CACHE } from "./private";
import Stripe from "stripe";

export const getPortal = action({
  args: { restaurantId: v.string() },
  handler: async (context, args): Promise<{ url: string }> => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    const isAllowed = await (context as any).db
      .query("restaurants")
      .filter((q: any) =>
        q.and(q.eq("_id", args.restaurantId as any), q.eq("owner_id", userId))
      )
      .unique();

    if (!isAllowed)
      throw new Error(
        "You don't have permission to manage billing for this restaurant"
      );

    return await context.runAction(internal.billing.private.getPortal_, {
      entityId: args.restaurantId,
    });
  },
});

export const checkout = action({
  args: { restaurantId: v.string(), priceId: v.string() },
  handler: async (context, args): Promise<{ url: string | null }> => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    const isAllowed = await (context as any).db
      .query("restaurants")
      .filter((q: any) =>
        q.and(q.eq("_id", args.restaurantId as any), q.eq("owner_id", userId))
      )
      .unique();

    if (!isAllowed)
      throw new Error(
        "You don't have permission to manage billing for this restaurant"
      );

    return await context.runAction(internal.billing.private.checkout_, {
      entityId: args.restaurantId,
      priceId: args.priceId,
    });
  },
});

export const getSubscription = action({
  args: { restaurantId: v.string() },
  handler: async (context, args): Promise<STRIPE_SUB_CACHE> => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    const isAllowed = await (context as any).db
      .query("restaurants")
      .filter((q: any) =>
        q.and(q.eq("_id", args.restaurantId as any), q.eq("owner_id", userId))
      )
      .unique();

    if (!isAllowed)
      throw new Error(
        "You don't have permission to manage billing for this restaurant"
      );

    return await context.runAction(internal.billing.private.getSubscription_, {
      entityId: args.restaurantId,
    });
  },
});

export const getPlans = action({
  args: {},
  handler: async (
    context
  ): Promise<
    {
      stripePriceId: string;
      stripeProductId: string;
      name: string;
      description: string | null;
      currency: string;
      amount: number;
      interval: Stripe.Price.Recurring.Interval | undefined;
    }[]
  > => {
    return await context.runAction(internal.billing.private.getPlans_);
  },
});

export const getLimits = action({
  args: { priceId: v.string() },
  handler: async (context, args): Promise<Record<string, any>> => {
    return await context.runAction(internal.billing.private.getLimits_, {
      priceId: args.priceId,
    });
  },
});

export const getFeatures = action({
  args: { priceId: v.string() },
  handler: async (context, args): Promise<Record<string, any>> => {
    return await context.runAction(internal.billing.private.getFeatures_, {
      priceId: args.priceId,
    });
  },
});
