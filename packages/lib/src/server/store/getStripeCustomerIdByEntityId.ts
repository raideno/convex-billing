import { v } from "convex/values";

import { define } from ".";
import { InternalConfiguration } from "../helpers";
import { MutationCtx } from "../schema";

export const getStripeCustomerIdByEntityId = define({
  type: "getStripeCustomerIdByEntityId",
  args: {
    entityId: v.string(),
  },
  handler: async (
    context: MutationCtx,
    args,
    configuration: InternalConfiguration
  ) => {
    const entityId = args.entityId;
    const existing = await context.db
      .query("convex_billing_customers")
      .filter((q) => q.eq(q.field("entityId"), entityId))
      .unique();
    const value = existing ? existing.stripeCustomerId : null;
    return value;
  },
});
