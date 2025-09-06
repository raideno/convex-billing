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
      if (existing && existing.stripe.updated === product.updated) {
        continue;
      }

      await billingDispatchTyped(
        {
          op: "upsert",
          table: "convex_billing_products",
          idField: "productId",
          data: {
            productId: product.id,
            stripe: {
              id: product.id,
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
            },
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
            stripe: {
              id: price.id,
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
            },
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
      .list({
        limit: 100,
        expand: ["data.default_payment_method", "data.customer"],
      })
      .autoPagingToArray({ limit: 10_000 });

    for (const subscription of subscriptions) {
      if (
        typeof subscription.customer !== "string" &&
        !subscription.customer.deleted &&
        !Object.keys(subscription.customer.metadata).includes("entityId")
      ) {
        configuration.logger.error(
          `Skipping subscription ${subscription.id} because it has no entityId metadata. This is due to the subscription being created outside of the checkout flow created by convex-billing.`
        );
        continue;
      }

      if (
        typeof subscription.customer !== "string" &&
        subscription.customer.deleted
      ) {
        await billingDispatchTyped(
          {
            op: "deleteById",
            table: "convex_billing_customers",
            idField: "customerId",
            idValue: subscription.customer.id,
          },
          context,
          configuration
        );
      } else if (
        typeof subscription.customer !== "string" &&
        !subscription.customer.deleted
      ) {
        const customer = subscription.customer;
        const entityId = subscription.customer.metadata["entityId"];
        const customerId = subscription.customer.id;

        await billingDispatchTyped(
          {
            op: "upsert",
            table: "convex_billing_customers",
            idField: "entityId",
            data: {
              entityId: entityId,
              customerId: customerId,
              stripe: {
                id: customer.id,
                address: customer.address,
                description: customer.description,
                email: customer.email,
                metadata: customer.metadata,
                name: customer.name,
                phone: customer.phone,
                shipping: customer.shipping,
                tax: customer.tax,
                object: customer.object,
                balance: customer.balance,
                cash_balance: customer.cash_balance,
                created: customer.created,
                currency: customer.currency,
                default_source:
                  typeof customer.default_source === "string"
                    ? customer.default_source
                    : customer.default_source?.id,
                delinquent: customer.delinquent,
                discount: customer.discount,
                invoice_credit_balance: customer.invoice_credit_balance,
                invoice_prefix: customer.invoice_prefix,
                invoice_settings: customer.invoice_settings,
                livemode: customer.livemode,
                next_invoice_sequence: customer.next_invoice_sequence,
                preferred_locales: customer.preferred_locales,
                sources: customer.sources,
                subscriptions: customer.subscriptions,
                tax_exempt: customer.tax_exempt,
                tax_ids: customer.tax_ids,
                test_clock:
                  typeof customer.test_clock === "string"
                    ? customer.test_clock
                    : customer.test_clock?.id,
              },
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
            idField: "customerId",
            data: {
              customerId: customerId,
              subscriptionId: subscription.id,
              stripe: subscription,
              last_synced_at: Date.now(),
            },
          },
          context,
          configuration
        );
      } else {
        configuration.logger.error(
          `Skipping subscription ${subscription.id} because it has no entityId metadata. This is due to the subscription being created outside of the checkout flow created by convex-billing.`
        );
        continue;
      }
    }

    /**
     * Mark customers without any subscription as unsubscribed.
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
      if (!hasSub.has(sub.customerId)) {
        await billingDispatchTyped(
          {
            op: "upsert",
            table: "convex_billing_subscriptions",
            idField: "customerId",
            data: {
              customerId: sub.customerId,
              subscriptionId: null,
              stripe: null,
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
