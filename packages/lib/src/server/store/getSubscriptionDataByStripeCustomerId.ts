import { v } from "convex/values";

import { define } from ".";

export const getSubscriptionDataByStripeCustomerId = define({
  type: "getSubscriptionDataByStripeCustomerId",
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (context, args, configuration) => {
    const stripeCustomerId = args.stripeCustomerId;
    const existing = await context.db
      .query("convex_billing_subscriptions")
      .filter((q) => q.eq(q.field("stripeCustomerId"), stripeCustomerId))
      .unique();
    const value = existing ? existing.data : null;
    return value;
  },
});
