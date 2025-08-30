// tables.ts

import { v } from "convex/values";
import { defineTable } from "convex/server";

export const billingTables = {
  kv: defineTable({
    key: v.string(),
    value: v.any(),
    expiresAt: v.optional(v.number()),
  }).index("by_key", ["key"]),
};
