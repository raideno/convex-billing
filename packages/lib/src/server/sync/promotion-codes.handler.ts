import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { PromotionCodeStripeToConvex } from "@/schema/promotion-code";
import { storeDispatchTyped } from "@/store";

export const PromotionCodesSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "promotionCodes",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripePromotionCodes !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localPromotionCodesRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripePromotionCodes",
      },
      context,
      configuration
    );
    const localPromotionCodesById = new Map(
      (localPromotionCodesRes.docs || []).map((p: any) => [
        p.promotionCodeId,
        p,
      ])
    );

    const promotionCodes = await stripe.promotionCodes
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripePromotionCodeIds = new Set<string>();

    for (const promotionCode of promotionCodes) {
      stripePromotionCodeIds.add(promotionCode.id);

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripePromotionCodes",
          idField: "promotionCodeId",
          data: {
            promotionCodeId: promotionCode.id,
            stripe: PromotionCodeStripeToConvex(promotionCode),
            lastSyncedAt: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [promotionCodeId] of localPromotionCodesById.entries()) {
      if (!stripePromotionCodeIds.has(promotionCodeId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripePromotionCodes",
            idField: "promotionCodeId",
            idValue: promotionCodeId,
          },
          context,
          configuration
        );
      }
    }
  },
});
