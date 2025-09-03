import { Infer } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { billingDispatchTyped } from "@/operations/helpers";
import { PriceObject } from "@/schema/price";

export const sync = defineActionImplementation({
  args: {},
  name: "sync",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localProductsRes = await billingDispatchTyped(
      {
        op: "selectAll",
        table: "convex_billing_products",
      },
      context,
      configuration
    );
    const localProductsById = new Map(
      (localProductsRes.docs || []).map((p) => [p.productId, p])
    );

    const products = await stripe.products
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripeProductIds = new Set<string>();

    for (const product of products) {
      stripeProductIds.add(product.id);

      const existing = localProductsById.get(product.id);
      if (existing && existing.updated === product.updated) {
        continue;
      }

      await billingDispatchTyped(
        {
          op: "upsert",
          table: "convex_billing_products",
          idField: "productId",
          data: {
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
          },
        },
        context,
        configuration
      );
    }

    for (const [productId, doc] of localProductsById.entries()) {
      if (!stripeProductIds.has(productId)) {
        await billingDispatchTyped(
          {
            op: "deleteById",
            table: "convex_billing_products",
            idField: "productId",
            idValue: productId,
          },
          context,
          configuration
        );
      }
    }

    const localPricesRes = await billingDispatchTyped(
      {
        op: "selectAll",
        table: "convex_billing_prices",
      },
      context,
      configuration
    );
    const localPricesById = new Map(
      (localPricesRes.docs || []).map((p: any) => [p.priceId, p])
    );

    const prices = await stripe.prices
      .list({ limit: 100, expand: ["data.product"] })
      .autoPagingToArray({ limit: 10_000 });

    const stripePriceIds = new Set<string>();

    for (const price of prices) {
      stripePriceIds.add(price.id);

      await billingDispatchTyped(
        {
          op: "upsert",
          table: "convex_billing_prices",
          idField: "priceId",
          data: {
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
          },
        },
        context,
        configuration
      );
    }

    for (const [priceId] of localPricesById.entries()) {
      if (!stripePriceIds.has(priceId)) {
        await billingDispatchTyped(
          {
            op: "deleteById",
            table: "convex_billing_prices",
            idField: "priceId",
            idValue: priceId,
          },
          context,
          configuration
        );
      }
    }

    const subscriptions = await stripe.subscriptions
      .list({ limit: 100, expand: ["data.default_payment_method"] })
      .autoPagingToArray({ limit: 10_000 });

    for (const subscription of subscriptions) {
      if (
        !subscription.metadata ||
        !Object.keys(subscription.metadata).includes("entityId")
      ) {
        configuration.logger.error(
          `Skipping subscription ${subscription.id} because it has no entityId metadata. This is due to the subscription being created outside of the checkout flow created by convex-billing.`
        );
        continue;
      }

      const entityId = subscription.metadata["entityId"];
      const stripeCustomerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      await billingDispatchTyped(
        {
          op: "upsert",
          table: "convex_billing_customers",
          idField: "entityId",
          data: {
            entityId: entityId,
            stripeCustomerId: stripeCustomerId,
            last_synced_at: Date.now(),
          },
        },
        context,
        configuration
      );

      await billingDispatchTyped(
        {
          op: "upsert",
          table: "convex_billing_subscriptions",
          idField: "stripeCustomerId",
          data: {
            stripeCustomerId,
            data: subscription,
            last_synced_at: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    /**
     * Mark customers without any subscription as unsubscribed in cache (write { data: null }), similar to sync-subscription.ts behavior.
     */
    const localSubsRes = await billingDispatchTyped(
      { op: "selectAll", table: "convex_billing_subscriptions" },
      context,
      configuration
    );
    const hasSub = new Set<string>(
      subscriptions.map((s) =>
        typeof s.customer === "string" ? s.customer : s.customer.id
      )
    );
    for (const sub of localSubsRes.docs || []) {
      if (!hasSub.has(sub.stripeCustomerId)) {
        await billingDispatchTyped(
          {
            op: "upsert",
            table: "convex_billing_subscriptions",
            idField: "stripeCustomerId",
            data: {
              stripeCustomerId: sub.stripeCustomerId,
              data: null,
              last_synced_at: Date.now(),
            },
          },
          context,
          configuration
        );
      }
    }
  },
});
