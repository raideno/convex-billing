import { v } from "convex/values";

import { InternalConfiguration } from "../types";
import { defineMutationImplementation } from "../helpers";

export const getStripeCustomerIdByEntityId = defineMutationImplementation({
  name: "getStripeCustomerIdByEntityId",
  args: {
    entityId: v.string(),
  },
  handler: async (context, args, configuration) => {
    const entityId = args.entityId;
    const existing = await context.db
      .query("convex_billing_customers")
      .filter((q) => q.eq(q.field("entityId"), entityId))
      .unique();
    const value = existing ? existing.stripeCustomerId : null;
    return value;
  },
});
