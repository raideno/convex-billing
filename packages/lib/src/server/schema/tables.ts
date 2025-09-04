import {
  DataModelFromSchemaDefinition,
  defineSchema,
  defineTable,
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  TableNamesInDataModel,
} from "convex/server";

import { GenericDoc } from "../types";
import { CustomerSchema } from "./customer";
import { PriceSchema } from "./price";
import { ProductSchema } from "./product";
import { SubscriptionSchema } from "./subscription";

export const billingTables = {
  convex_billing_products: defineTable(ProductSchema)
    .index("byActive", ["active"])
    .index("byName", ["name"]),
  convex_billing_prices: defineTable(PriceSchema)
    .index("byProductId", ["productId"])
    .index("byActive", ["active"])
    .index("byCurrency", ["currency"]),
  convex_billing_customers: defineTable(CustomerSchema)
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
