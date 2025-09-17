import { v } from "convex/values";
import Stripe from "stripe";

import { storeDispatchTyped } from "@/store";

import { defineActionImplementation } from "../helpers";

export const SetupImplementation = defineActionImplementation({
  name: "setup",
  args: v.object({
    entityId: v.string(),
    email: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  }),
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    // TODO: is it enough to check on the locally synced version, what if someone modifies the dashboard in the mean time
    // And deletes the customer, we'll then have an issue as we'll return a customerId that don't exist anymore
    const stripeCustomer = await storeDispatchTyped(
      {
        operation: "selectOne",
        table: "stripe_customers",
        field: "entityId",
        value: args.entityId,
      },
      context,
      configuration
    );

    let customerId = stripeCustomer?.doc!.customerId || null;

    if (customerId) {
      return { customerId: stripeCustomer.doc!.stripe.id };
    } else {
      const customer = await stripe.customers.create({
        email: args.email ? args.email : undefined,
        metadata: {
          ...(args.metadata || {}),
          entityId: args.entityId,
        },
      });

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripe_customers",
          idField: "entityId",
          data: {
            entityId: args.entityId,
            customerId: customer.id,
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

      customerId = customer.id;

      return { customerId: customer.id };
    }
  },
});
