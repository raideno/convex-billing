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
import { nullablenumber, nullablestring } from "./helpers";
import { PriceSchema } from "./price";
import { ProductSchema } from "./product";

export const billingTables = {
  convex_billing_kv: defineTable({
    key: v.string(),
    value: v.string(),
  }),
  // --- --- ---
  // TODO: add indexes
  convex_billing_products: defineTable(ProductSchema),
  // TODO: add indexes
  convex_billing_prices: defineTable(PriceSchema),
  // --- --- ---
  convex_billing_customers: defineTable({
    entityId: v.string(),
    stripeCustomerId: v.string(),
  }).index("byEntityId", ["entityId"]),
  convex_billing_subscriptions: defineTable({
    stripeCustomerId: v.string(),
    data: v.union(
      v.object({
        subscriptionId: nullablestring(),
        status: v.string(),
        priceId: nullablestring(),
        currentPeriodStart: nullablenumber(),
        currentPeriodEnd: nullablenumber(),
        cancelAtPeriodEnd: v.boolean(),
        paymentMethod: v.union(
          v.object({
            brand: nullablestring(),
            last4: nullablestring(),
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
