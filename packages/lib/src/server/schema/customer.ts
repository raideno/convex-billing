import { v } from "convex/values";

export const CustomerSchema = {
  entityId: v.string(),
  stripeCustomerId: v.string(),
  last_synced_at: v.number(),
};

export const CustomerObject = v.object(CustomerSchema);
