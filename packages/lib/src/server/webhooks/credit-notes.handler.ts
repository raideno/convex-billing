import { CreditNoteStripeToConvex } from "@/schema/credit-note";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: ["credit_note.created", "credit_note.updated", "credit_note.voided"],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripe_credit_notes !== true) return;

    const creditNote = event.data.object;

    switch (event.type) {
      case "credit_note.created":
      case "credit_note.updated":
      case "credit_note.voided":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripe_credit_notes",
            idField: "creditNoteId",
            data: {
              creditNoteId: creditNote.id,
              stripe: CreditNoteStripeToConvex(creditNote),
              last_synced_at: Date.now(),
            },
          },
          context,
          configuration
        );
        break;
    }
  },
});
