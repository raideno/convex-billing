import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { InternalConfiguration } from "../helpers";
import { PriceObject } from "../schema/price";
import { ProductObject } from "../schema/product";
import { MutationCtx } from "../schema/tables";

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
    }),
    v.object({
      type: v.literal("persistProducts"),
      products: v.any(),
    }),
    v.object({
      type: v.literal("persistPrices"),
      prices: v.any(),
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
    case "persistPrices": {
      const prices = args.data.prices as Stripe.Price[];

      const existingPrices = await context.db
        .query("convex_billing_prices")
        .collect();
      for (const p of existingPrices) {
        await context.db.delete(p._id);
      }

      for (const price of prices) {
        const priceObj: Infer<typeof PriceObject> = {
          priceId: price.id,
          object: price.object,
          active: price.active,
          currency: price.currency as Infer<typeof PriceObject>["currency"],
          metadata: price.metadata || {},
          nickname: price.nickname,
          recurring: price.recurring,
          productId:
            typeof price.product === "string"
              ? price.product
              : price.product.id,
          type: price.type,
          unit_amount: price.unit_amount,
          billing_scheme: price.billing_scheme,
          created: price.created,
          livemode: price.livemode,
          lookup_key: price.lookup_key,
          tiers_mode: price.tiers_mode,
          transform_quantity: price.transform_quantity,
          unit_amount_decimal: price.unit_amount_decimal,
          last_synced_at: Date.now(),
        };

        await context.db.insert("convex_billing_prices", priceObj);
      }

      return { ok: true } as const;
    }

    case "persistProducts": {
      const products = args.data.products as Stripe.Product[];

      const existingProducts = await context.db
        .query("convex_billing_products")
        .collect();
      for (const p of existingProducts) {
        await context.db.delete(p._id);
      }

      for (const product of products) {
        const productObj: Infer<typeof ProductObject> = {
          productId: product.id,
          object: product.object,
          active: product.active,
          description: product.description,
          metadata: product.metadata || {},
          name: product.name,
          created: product.created,
          images: product.images,
          livemode: product.livemode,
          package_dimensions: product.package_dimensions,
          shippable: product.shippable,
          statement_descriptor: product.statement_descriptor || null,
          unit_label: product.unit_label || null,
          updated: product.updated,
          url: product.url,
          marketing_features: product.marketing_features,
          default_price:
            typeof product.default_price === "string"
              ? product.default_price
              : product.default_price?.id || null,
          last_synced_at: Date.now(),
        };

        await context.db.insert("convex_billing_products", productObj);
      }

      return { ok: true } as const;
    }
    default: {
      throw new Error("Unknown store type");
    }
  }
};
