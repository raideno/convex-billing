import { Infer, v } from "convex/values";

import { InternalConfiguration } from "./helpers";
import { MutationCtx } from "./tables";

export const StoreInputValidator = v.object({
  data: v.union(
    v.object({
      type: v.literal("persistStripeCustomerId"),
      entityId: v.string(),
      stripeCustomerId: v.string(),
    }),
    v.object({
      type: v.literal("getStripeCustomerIdByEntityId"),
      entityId: v.string(),
    }),
    v.object({
      type: v.literal("persistSubscriptionData"),
      stripeCustomerId: v.string(),
      data: v.any(),
    }),
    v.object({
      type: v.literal("getSubscriptionDataByStripeCustomerId"),
      stripeCustomerId: v.string(),
    })
  ),
});

export const storeImplementation = async (
  context: MutationCtx,
  args: Infer<typeof StoreInputValidator>,
  configuration: InternalConfiguration
) => {
  switch (args.data.type) {
    case "persistStripeCustomerId": {
      const entityId = args.data.entityId;
      const existing = await context.db
        .query("convex_billing_customers")
        .filter((q) => q.eq(q.field("entityId"), entityId))
        .unique();

      if (existing) {
        await context.db.patch(existing._id, {
          stripeCustomerId: args.data.stripeCustomerId,
        });
      } else {
        await context.db.insert("convex_billing_customers", {
          entityId: args.data.entityId,
          stripeCustomerId: args.data.stripeCustomerId,
        });
      }
      return { ok: true } as const;
    }
    case "getStripeCustomerIdByEntityId": {
      const entityId = args.data.entityId;
      const existing = await context.db
        .query("convex_billing_customers")
        .filter((q) => q.eq(q.field("entityId"), entityId))
        .unique();
      const value = existing ? existing.stripeCustomerId : null;
      return { value } as const;
    }
    case "persistSubscriptionData": {
      const stripeCustomerId = args.data.stripeCustomerId;
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
      return { ok: true } as const;
    }
    case "getSubscriptionDataByStripeCustomerId": {
      const stripeCustomerId = args.data.stripeCustomerId;
      const existing = await context.db
        .query("convex_billing_subscriptions")
        .filter((q) => q.eq(q.field("stripeCustomerId"), stripeCustomerId))
        .unique();
      const value = existing ? existing.data : null;
      return { value } as const;
    }
    default: {
      throw new Error("Unknown store type");
    }
  }
};
