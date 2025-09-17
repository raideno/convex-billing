import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { CustomerStripeToConvex } from "@/schema/customer";
import { storeDispatchTyped } from "@/store";

export const CustomersSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "customers",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripe_customers !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localCustomersRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripe_customers",
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
          table: "stripe_customers",
          idField: "customerId",
          data: {
            customerId: customer.id,
            entityId: customer.metadata.entityId,
            stripe: CustomerStripeToConvex(customer),
            last_synced_at: Date.now(),
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
            table: "stripe_customers",
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
