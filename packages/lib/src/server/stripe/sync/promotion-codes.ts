import { Infer } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { billingDispatchTyped } from "@/operations/helpers";
import { PromotionCodeSchema } from "@/schema/promotion-code";

export const PromotionCodesSyncImplementation = defineActionImplementation({
  args: {},
  name: "promotionCodes",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localPromotionCodesRes = await billingDispatchTyped(
      {
        op: "selectAll",
        table: "convex_billing_promotion_codes",
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
                  (typeof PromotionCodeSchema)["coupon"]
                >["currency"],
              },
            },
            last_synced_at: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [promotionCodeId] of localPromotionCodesById.entries()) {
      if (!stripePromotionCodeIds.has(promotionCodeId)) {
        await billingDispatchTyped(
          {
            op: "deleteById",
            table: "convex_billing_promotion_codes",
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
