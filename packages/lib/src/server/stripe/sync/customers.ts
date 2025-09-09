import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { billingDispatchTyped } from "@/operations/helpers";

export const CustomersSyncImplementation = defineActionImplementation({
  args: {},
  name: "customers",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localCustomersRes = await billingDispatchTyped(
      {
        op: "selectAll",
        table: "convex_billing_customers",
      },
      context,
      configuration
    );
    const localCustomersById = new Map(
      (localCustomersRes.docs || []).map((p: any) => [p.customerId, p])
    );

    const customers = await stripe.customers
      .list({ limit: 100, expand: ["data.product"] })
      .autoPagingToArray({ limit: 10_000 });

    const stripeCustomerIds = new Set<string>();

    for (const customer of customers) {
      stripeCustomerIds.add(customer.id);

      const entityId = customer.metadata?.entityId;

      if (!entityId) {
        console.warn(`Customer ${customer.id} is missing entityId in metadata`);
        continue;
      }

      await billingDispatchTyped(
        {
          op: "upsert",
          table: "convex_billing_customers",
          idField: "customerId",
          data: {
            customerId: customer.id,
            entityId: customer.metadata.entityId,
            stripe: {
              ...customer,
              default_source:
                typeof customer.default_source === "string"
                  ? customer.default_source
                  : customer.default_source?.id,
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
    }

    for (const [customerId] of localCustomersById.entries()) {
      if (!stripeCustomerIds.has(customerId)) {
        await billingDispatchTyped(
          {
            op: "deleteById",
            table: "convex_billing_customers",
            idField: "customerId",
            idValue: customerId,
          },
          context,
          configuration
        );
      }
    }
  },
});
