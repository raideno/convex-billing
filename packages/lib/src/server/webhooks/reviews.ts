import { ReviewStripeToConvex } from "@/schema/review";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export const ReviewsWebhooksHandler = defineWebhookHandler({
  events: ["review.closed", "review.opened"],
  handle: async (event, context, configuration) => {
    const review = event.data.object;

    switch (event.type) {
      case "review.closed":
      case "review.opened":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "convex_stripe_reviews",
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
