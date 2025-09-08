import Stripe from "stripe";

import { billingDispatchTyped } from "@/operations/helpers";

import { defineWebhookHandler } from "./types";

export const CustomersWebhookHandler = defineWebhookHandler({
  events: ["customer.created", "customer.deleted"],
  handle: async (event, context, configuration) => {
    const customerId = event.data.object.id;

    const customer = event.data.object as Stripe.Customer;
    const entityId = customer.metadata.entityId;

    switch (event.type) {
      case "customer.created":
        if (!entityId)
          configuration.logger.warn(
            "No entityId associated with newly created customer."
          );
        else
          await billingDispatchTyped(
            {
              op: "upsert",
              table: "convex_billing_customers",
              idField: "entityId",
              data: {
                customerId: customer.id,
                entityId: entityId,
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
        break;
      case "customer.deleted":
        billingDispatchTyped(
          {
            op: "deleteById",
            table: "convex_billing_customers",
            idField: "customerId",
            idValue: customerId,
          },
          context,
          configuration
        );
        break;
    }
  },
});
