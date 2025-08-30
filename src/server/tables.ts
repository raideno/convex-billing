// tables.ts

import {
  DataModelFromSchemaDefinition,
  defineSchema,
  defineTable,
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  TableNamesInDataModel,
} from "convex/server";
import { v } from "convex/values";
import { GenericDoc } from "./types";

export const billingTables = {
  kv: defineTable({
    key: v.string(),
    value: v.string(),
  }),
  stripe_customers: defineTable({
    entityId: v.string(),
    stripeCustomerId: v.string(),
  })
    .index("byEntity", ["entityId"])
    .index("byStripeCustomer", ["stripeCustomerId"]),
  stripe_subscriptions: defineTable({
    stripeCustomerId: v.string(),
    // STRIPE_SUB_CACHE as-is
    data: v.any(),
    // ms since epoch, just informational
    updatedAt: v.number(),
  }).index("byStripeCustomer", ["stripeCustomerId"]),
  usage_counters: defineTable({
    stripeCustomerId: v.string(),
    name: v.string(),
    // seconds since epoch (Stripe values)
    periodStart: v.number(),
    // seconds since epoch (Stripe values)
    periodEnd: v.number(),
    usage: v.number(),
  }).index("byKey", ["stripeCustomerId", "name", "periodStart", "periodEnd"]),
};

const defaultSchema = defineSchema(billingTables);

export type AuthDataModel = DataModelFromSchemaDefinition<typeof defaultSchema>;
export type ActionCtx = GenericActionCtx<AuthDataModel>;
export type MutationCtx = GenericMutationCtx<AuthDataModel>;
export type QueryCtx = GenericQueryCtx<AuthDataModel>;
export type Doc<T extends TableNamesInDataModel<AuthDataModel>> = GenericDoc<
  AuthDataModel,
  T
>;
