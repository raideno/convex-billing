import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { InvoiceStripeToConvex } from "@/schema/invoice";
import { storeDispatchTyped } from "@/store";

export const InvoicesSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "invoices",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripe_invoices !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localInvoicesRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripe_invoices",
      },
      context,
      configuration
    );
    const localInvoicesById = new Map(
      (localInvoicesRes.docs || []).map((p: any) => [p.invoiceId, p])
    );

    const invoices = await stripe.invoices
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripeInvoiceIds = new Set<string>();

    for (const invoice of invoices) {
      if (invoice.id === undefined) {
        console.warn("Invoice with undefined ID found, skipping");
        continue;
      }

      stripeInvoiceIds.add(invoice.id);

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripe_invoices",
          idField: "invoiceId",
          data: {
            invoiceId: invoice.id,
            stripe: InvoiceStripeToConvex({
              id: invoice.id,
              ...invoice,
            }),
            last_synced_at: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [invoiceId] of localInvoicesById.entries()) {
      if (!stripeInvoiceIds.has(invoiceId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripe_invoices",
            idField: "invoiceId",
            idValue: invoiceId,
          },
          context,
          configuration
        );
      }
    }
  },
});
