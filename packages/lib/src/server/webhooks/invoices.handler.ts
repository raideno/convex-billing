import { InvoiceStripeToConvex } from "@/schema/invoice";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: [
    "invoice.created",
    "invoice.deleted",
    "invoice.finalization_failed",
    "invoice.finalized",
    "invoice.marked_uncollectible",
    "invoice.overdue",
    "invoice.overpaid",
    "invoice.paid",
    "invoice.payment_action_required",
    "invoice.payment_failed",
    "invoice.payment_succeeded",
    "invoice.sent",
    "invoice.upcoming",
    "invoice.updated",
    "invoice.voided",
    "invoice.will_be_due",
  ],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripeInvoices !== true) return;

    const invoice = event.data.object;

    switch (event.type) {
      case "invoice.created":
      case "invoice.deleted":
      case "invoice.finalization_failed":
      case "invoice.finalized":
      case "invoice.marked_uncollectible":
      case "invoice.overdue":
      case "invoice.overpaid":
      case "invoice.paid":
      case "invoice.payment_action_required":
      case "invoice.payment_failed":
      case "invoice.payment_succeeded":
      case "invoice.sent":
      case "invoice.upcoming":
      case "invoice.updated":
      case "invoice.voided":
      case "invoice.will_be_due":
        if (invoice.id === undefined) {
          console.error("Received invoice event with no ID, skipping");
          return;
        }

        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripeInvoices",
            idField: "invoiceId",
            data: {
              invoiceId: invoice.id,
              stripe: InvoiceStripeToConvex({
                id: invoice.id,
                ...invoice,
              }),
              lastSyncedAt: Date.now(),
            },
          },
          context,
          configuration
        );
        break;
    }
  },
});
