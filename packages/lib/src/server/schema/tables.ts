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

import { GenericDoc } from "../types";
import { PriceSchema } from "./price";
import { ProductSchema } from "./product";
import { SubscriptionSchema } from "./subscription";

export const billingTables = {
  convex_billing_products: defineTable(ProductSchema),
  convex_billing_prices: defineTable(PriceSchema),
  convex_billing_customers: defineTable({
    entityId: v.string(),
    stripeCustomerId: v.string(),
  })
    .index("byEntityId", ["entityId"])
    .index("byStripeCustomerId", ["stripeCustomerId"]),
  convex_billing_subscriptions: defineTable(SubscriptionSchema).index(
    "byStripeCustomerId",
    ["stripeCustomerId"]
  ),
};

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
