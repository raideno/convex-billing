import { PromotionCodeStripeToConvex } from "@/schema/promotion-code";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export const PromotionCodesWebhooksHandler = defineWebhookHandler({
  events: ["promotion_code.created", "promotion_code.updated"],
  handle: async (event, context, configuration) => {
    const promotionCode = event.data.object;

    switch (event.type) {
      case "promotion_code.created":
      case "promotion_code.updated":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "convex_stripe_promotion_codes",
            idField: "promotionCodeId",
            data: {
              promotionCodeId: promotionCode.id,
              stripe: PromotionCodeStripeToConvex(promotionCode),
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
