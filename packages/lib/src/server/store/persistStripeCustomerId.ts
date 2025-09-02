import { v } from "convex/values";
import { defineMutationImplementation } from "../helpers";

export const persistStripeCustomerId = defineMutationImplementation({
  name: "persistStripeCustomerId",
  args: {
    entityId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (context, args, configuration) => {
    const entityId = args.entityId;
    const existing = await context.db
      .query("convex_billing_customers")
      .filter((q) => q.eq(q.field("entityId"), entityId))
      .unique();

    if (existing) {
      await context.db.patch(existing._id, {
        stripeCustomerId: args.stripeCustomerId,
      });
    } else {
      await context.db.insert("convex_billing_customers", {
        entityId: args.entityId,
        stripeCustomerId: args.stripeCustomerId,
      });
    }
  },
});
