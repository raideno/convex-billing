import { v } from "convex/values";

export const SubscriptionSchema = {
  stripeCustomerId: v.string(),
  data: v.any(),
  last_synced_at: v.number(),
};

export const SubscriptionObject = v.object(SubscriptionSchema);
