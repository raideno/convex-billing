import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { CustomerStripeToConvex } from "@/schema/customer";
import { storeDispatchTyped } from "@/store";

export const CustomersSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "customers",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripeCustomers !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localCustomersRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripeCustomers",
      },
      context,
      configuration
    );
    const localCustomersById = new Map(
      (localCustomersRes.docs || []).map((p: any) => [p.customerId, p])
    );

    const customers = await stripe.customers
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripeCustomerIds = new Set<string>();

    for (const customer of customers) {
      stripeCustomerIds.add(customer.id);

      const entityId = customer.metadata?.entityId;

      if (!entityId) {
        console.warn(`Customer ${customer.id} is missing entityId in metadata`);
        continue;
      }

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripeCustomers",
          idField: "customerId",
          data: {
            customerId: customer.id,
            entityId: customer.metadata.entityId,
            stripe: CustomerStripeToConvex(customer),
            lastSyncedAt: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [customerId] of localCustomersById.entries()) {
      if (!stripeCustomerIds.has(customerId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripeCustomers",
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
