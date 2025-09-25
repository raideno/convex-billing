import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { ReviewStripeToConvex } from "@/schema/review";
import { storeDispatchTyped } from "@/store";

export const ReviewsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "reviews",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripeReviews !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localReviewsRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripeReviews",
      },
      context,
      configuration
    );
    const localReviewsById = new Map(
      (localReviewsRes.docs || []).map((p: any) => [p.reviewId, p])
    );

    const reviews = await stripe.reviews
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripeReviewIds = new Set<string>();

    for (const review of reviews) {
      stripeReviewIds.add(review.id);

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
    }

    for (const [reviewId] of localReviewsById.entries()) {
      if (!stripeReviewIds.has(reviewId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripeReviews",
            idField: "reviewId",
            idValue: reviewId,
          },
          context,
          configuration
        );
      }
    }
  },
});
