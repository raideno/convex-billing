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
  convex_billing_kv: defineTable({
    key: v.string(),
    value: v.string(),
  }),
  convex_billing_customers: defineTable({
    entityId: v.string(),
    stripeCustomerId: v.string(),
  }).index("byEntityId", ["entityId"]),
  convex_billing_subscriptions: defineTable({
    stripeCustomerId: v.string(),
    data: v.union(
      v.object({
        subscriptionId: v.union(v.string(), v.null()),
        status: v.string(),
        priceId: v.union(v.string(), v.null()),
        currentPeriodStart: v.union(v.number(), v.null()),
        currentPeriodEnd: v.union(v.number(), v.null()),
        cancelAtPeriodEnd: v.boolean(),
        paymentMethod: v.union(
          v.object({
            brand: v.union(v.string(), v.null()),
            last4: v.union(v.string(), v.null()),
          }),
          v.null()
        ),
      }),
      v.object({
        status: v.literal("none"),
      })
    ),
  }).index("byStripeCustomerId", ["stripeCustomerId"]),
};

export type STRIPE_SUB_CACHE =
  BillingDataModel["convex_billing_subscriptions"]["document"]["data"];

const defaultSchema = defineSchema(billingTables);

export type BillingDataModel = DataModelFromSchemaDefinition<
  typeof defaultSchema
>;
export type ActionCtx = GenericActionCtx<BillingDataModel>;
export type MutationCtx = GenericMutationCtx<BillingDataModel>;
export type QueryCtx = GenericQueryCtx<BillingDataModel>;
export type Doc<T extends TableNamesInDataModel<BillingDataModel>> = GenericDoc<
  BillingDataModel,
  T
>;
