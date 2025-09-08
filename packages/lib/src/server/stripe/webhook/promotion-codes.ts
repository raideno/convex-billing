import { Infer } from "convex/values";
import Stripe from "stripe";

import { billingDispatchTyped } from "@/operations/helpers";
import { CouponSchema } from "@/schema/coupon";

import { defineWebhookHandler } from "./types";

export const PromotionCodesWebhooksHandler = defineWebhookHandler({
  events: ["promotion_code.created", "promotion_code.updated"],
  handle: async (event, context, configuration) => {
    const promotionCodeId = event.data.object.id;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    switch (event.type) {
      case "promotion_code.created":
      case "promotion_code.updated":
        const promotionCode =
          await stripe.promotionCodes.retrieve(promotionCodeId);
        await billingDispatchTyped(
          {
            op: "upsert",
            table: "convex_billing_promotion_codes",
            idField: "promotionCodeId",
            data: {
              promotionCodeId: promotionCode.id,
              stripe: {
                ...promotionCode,
                customer:
                  typeof promotionCode.customer === "string"
                    ? promotionCode.customer
                    : promotionCode.customer?.id || null,
                coupon: {
                  ...promotionCode.coupon,
                  currency: promotionCode.coupon.currency as Infer<
                    (typeof CouponSchema)["currency"]
                  >,
                },
              },
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
