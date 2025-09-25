import { PromotionCodeStripeToConvex } from "@/schema/promotion-code";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: ["promotion_code.created", "promotion_code.updated"],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripePromotionCodes !== true) return;

    const promotionCode = event.data.object;

    switch (event.type) {
      case "promotion_code.created":
      case "promotion_code.updated":
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
        break;
    }
  },
});
