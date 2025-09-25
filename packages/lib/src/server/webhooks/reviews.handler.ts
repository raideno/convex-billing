import { ReviewStripeToConvex } from "@/schema/review";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: ["review.closed", "review.opened"],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripeReviews !== true) return;

    const review = event.data.object;

    switch (event.type) {
      case "review.closed":
      case "review.opened":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripeReviews",
            idField: "reviewId",
            data: {
              reviewId: review.id,
              stripe: ReviewStripeToConvex(review),
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
