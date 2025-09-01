import { v } from "convex/values";

import { define } from ".";

export const persistSubscriptionData = define({
  type: "persistSubscriptionData",
  args: {
    stripeCustomerId: v.string(),
    data: v.any(),
  },
  handler: async (context, args, configuration) => {
    const stripeCustomerId = args.stripeCustomerId;
    const existing = await context.db
      .query("convex_billing_subscriptions")
      .filter((q) => q.eq(q.field("stripeCustomerId"), stripeCustomerId))
      .unique();

    if (existing) {
      await context.db.patch(existing._id, { data: args.data.data });
    } else {
      await context.db.insert("convex_billing_subscriptions", {
        stripeCustomerId: args.data.stripeCustomerId,
        data: args.data.data,
      });
    }
  },
});
