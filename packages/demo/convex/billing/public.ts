import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internal } from "../_generated/api";
import { action } from "../_generated/server";

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
      returnUrl: "http://localhost:3000/return-from-portal",
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
      successUrl: "http://localhost:3000/return-from-checkout-success",
      cancelUrl: "http://localhost:3000/return-from-checkout-cancel",
    });
  },
});
