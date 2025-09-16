import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { RefundStripeToConvex } from "@/schema/refund";
import { billingDispatchTyped } from "@/store";

export const RefundsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "refunds",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localRefundsRes = await billingDispatchTyped(
      {
        operation: "selectAll",
        table: "convex_billing_refunds",
      },
      context,
      configuration
    );
    const localRefundsById = new Map(
      (localRefundsRes.docs || []).map((p: any) => [p.refundId, p])
    );

    const refunds = await stripe.refunds
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripeRefundIds = new Set<string>();

    for (const refund of refunds) {
      stripeRefundIds.add(refund.id);

      await billingDispatchTyped(
        {
          operation: "upsert",
          table: "convex_billing_refunds",
          idField: "refundId",
          data: {
            refundId: refund.id,
            stripe: RefundStripeToConvex(refund),
            last_synced_at: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [refundId] of localRefundsById.entries()) {
      if (!stripeRefundIds.has(refundId)) {
        await billingDispatchTyped(
          {
            operation: "deleteById",
            table: "convex_billing_refunds",
            idField: "refundId",
            idValue: refundId,
          },
          context,
          configuration
        );
      }
    }
  },
});
