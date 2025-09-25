import { CreditNoteStripeToConvex } from "@/schema/credit-note";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: ["credit_note.created", "credit_note.updated", "credit_note.voided"],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripeCreditNotes !== true) return;

    const creditNote = event.data.object;

    switch (event.type) {
      case "credit_note.created":
      case "credit_note.updated":
      case "credit_note.voided":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripeCreditNotes",
            idField: "creditNoteId",
            data: {
              creditNoteId: creditNote.id,
              stripe: CreditNoteStripeToConvex(creditNote),
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
