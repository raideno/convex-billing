import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { ReviewStripeToConvex } from "@/schema/review";
import { storeDispatchTyped } from "@/store";

export const ReviewsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "reviews",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localReviewsRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "convex_stripe_reviews",
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
    }

    for (const [reviewId] of localReviewsById.entries()) {
      if (!stripeReviewIds.has(reviewId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "convex_stripe_reviews",
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
