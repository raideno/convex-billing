import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { billingDispatchTyped } from "@/operations/helpers";

export const RefundsSyncImplementation = defineActionImplementation({
  args: {},
  name: "refunds",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localRefundsRes = await billingDispatchTyped(
      {
        op: "selectAll",
        table: "convex_billing_refunds",
      },
      context,
      configuration
    );
    const localRefundsById = new Map(
      (localRefundsRes.docs || []).map((p: any) => [p.refundId, p])
    );

    const refunds = await stripe.refunds
      .list({ limit: 100, expand: ["data.product"] })
      .autoPagingToArray({ limit: 10_000 });

    const stripeRefundIds = new Set<string>();

    for (const refund of refunds) {
      stripeRefundIds.add(refund.id);

      await billingDispatchTyped(
        {
          op: "upsert",
          table: "convex_billing_refunds",
          idField: "refundId",
          data: {
            refundId: refund.id,
            stripe: {
              ...refund,
              charge:
                typeof refund.charge === "string"
                  ? refund.charge
                  : refund.charge?.id,
              balance_transaction:
                typeof refund.balance_transaction === "string"
                  ? refund.balance_transaction
                  : refund.balance_transaction?.id || null,
              failure_balance_transaction:
                typeof refund.failure_balance_transaction === "string"
                  ? refund.failure_balance_transaction
                  : refund.failure_balance_transaction?.id || null,
              payment_intent:
                typeof refund.payment_intent === "string"
                  ? refund.payment_intent
                  : refund.payment_intent?.id || null,
              source_transfer_reversal:
                typeof refund.source_transfer_reversal === "string"
                  ? refund.source_transfer_reversal
                  : refund.source_transfer_reversal?.id || null,
              transfer_reversal:
                typeof refund.transfer_reversal === "string"
                  ? refund.transfer_reversal
                  : refund.transfer_reversal?.id || null,
            },
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
            op: "deleteById",
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
