import { ReviewStripeToConvex } from "@/schema/review";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: ["review.closed", "review.opened"],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripe_reviews !== true) return;

    const review = event.data.object;

    switch (event.type) {
      case "review.closed":
      case "review.opened":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripe_reviews",
            idField: "reviewId",
            data: {
              reviewId: review.id,
              stripe: ReviewStripeToConvex(review),
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
