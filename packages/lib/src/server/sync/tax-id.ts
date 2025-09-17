import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { TaxIdStripeToConvex } from "@/schema/tax-id";
import { storeDispatchTyped } from "@/store";

export const TaxIdsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "taxIds",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripe_tax_ids !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localTaxIdsRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripe_tax_ids",
      },
      context,
      configuration
    );
    const localTaxIdsById = new Map(
      (localTaxIdsRes.docs || []).map((p: any) => [p.taxIdId, p])
    );

    const taxIds = await stripe.taxIds
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripeTaxIdIds = new Set<string>();

    for (const taxId of taxIds) {
      stripeTaxIdIds.add(taxId.id);

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripe_tax_ids",
          idField: "taxIdId",
          data: {
            taxIdId: taxId.id,
            stripe: TaxIdStripeToConvex(taxId),
            last_synced_at: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [taxIdId] of localTaxIdsById.entries()) {
      if (!stripeTaxIdIds.has(taxIdId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripe_tax_ids",
            idField: "taxIdId",
            idValue: taxIdId,
          },
          context,
          configuration
        );
      }
    }
  },
});
