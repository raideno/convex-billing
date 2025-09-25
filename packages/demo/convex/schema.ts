import { authTables } from "@convex-dev/auth/server";
import { stripeTables } from "@raideno/convex-stripe/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...stripeTables,
  ...authTables,
  payments: defineTable({
    userId: v.id("users"),
    checkoutSessionId: v.string(),
    priceId: v.string(),
  })
    .index("byUserId", ["userId"])
    .index("byCheckoutSessionId", ["checkoutSessionId"])
    .index("byPriceId", ["priceId"]),
  messages: defineTable({
    userId: v.id("users"),
    name: v.string(),
    message: v.string(),
    planPriceId: v.optional(v.string()),
    planName: v.optional(v.string()),
    successfulPayments: v.number(),
  }).index("byUserId", ["userId"]),
});
