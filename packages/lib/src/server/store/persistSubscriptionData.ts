import { v } from "convex/values";
import { defineMutationImplementation } from "../helpers";
import { SubscriptionSchema } from "../schema/subscription";

export const persistSubscriptionData = defineMutationImplementation({
  name: "persistSubscriptionData",
  args: {
    stripeCustomerId: v.string(),
    data: v.object(SubscriptionSchema),
  },
  handler: async (context, args, configuration) => {
    const stripeCustomerId = args.stripeCustomerId;

    const existing = await context.db
      .query("convex_billing_subscriptions")
      .filter((q) => q.eq(q.field("stripeCustomerId"), stripeCustomerId))
      .unique();

    if (existing) {
      await context.db.patch(existing._id, {
        stripeCustomerId: stripeCustomerId,
        data: args.data,
        last_synced_at: Date.now(),
      });
    } else {
      await context.db.insert("convex_billing_subscriptions", {
        stripeCustomerId: stripeCustomerId,
        data: args.data,
        last_synced_at: Date.now(),
      });
    }
  },
});
