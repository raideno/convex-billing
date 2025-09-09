import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { billingDispatchTyped } from "@/operations/helpers";

export const SubscriptionsSyncImplementation = defineActionImplementation({
  args: {},
  name: "subscriptions",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

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

    const localSubsResponse = await billingDispatchTyped(
      { op: "selectAll", table: "convex_billing_subscriptions" },
      context,
      configuration
    );
    const hasSub = new Set<string>(
      subscriptions.map((s) =>
        typeof s.customer === "string" ? s.customer : s.customer.id
      )
    );
    for (const sub of localSubsResponse.docs || []) {
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
