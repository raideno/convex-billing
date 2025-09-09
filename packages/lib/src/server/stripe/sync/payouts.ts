import { Infer } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { billingDispatchTyped } from "@/operations/helpers";
import { PayoutSchema } from "@/schema/payout";

export const PayoutsSyncImplementation = defineActionImplementation({
  args: {},
  name: "payouts",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localPayoutsRes = await billingDispatchTyped(
      {
        op: "selectAll",
        table: "convex_billing_payouts",
      },
      context,
      configuration
    );
    const localPayoutsById = new Map(
      (localPayoutsRes.docs || []).map((p: any) => [p.payoutId, p])
    );

    const payouts = await stripe.payouts
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripePayoutIds = new Set<string>();

    for (const payout of payouts) {
      stripePayoutIds.add(payout.id);

      await billingDispatchTyped(
        {
          op: "upsert",
          table: "convex_billing_payouts",
          idField: "payoutId",
          data: {
            payoutId: payout.id,
            stripe: {
              ...payout,
              balance_transaction:
                typeof payout.balance_transaction === "string"
                  ? payout.balance_transaction
                  : payout.balance_transaction?.id,
              destination:
                typeof payout.destination === "string"
                  ? payout.destination
                  : payout.destination?.id,
              original_payout:
                typeof payout.original_payout === "string"
                  ? payout.original_payout
                  : payout.original_payout?.id,
              reversed_by:
                typeof payout.reversed_by === "string"
                  ? payout.reversed_by
                  : payout.reversed_by?.id,
              failure_balance_transaction:
                typeof payout.failure_balance_transaction === "string"
                  ? payout.failure_balance_transaction
                  : payout.failure_balance_transaction?.id,
              currency:
                (payout.currency as Infer<(typeof PayoutSchema)["currency"]>) ||
                undefined,
            },
            last_synced_at: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [payoutId] of localPayoutsById.entries()) {
      if (!stripePayoutIds.has(payoutId)) {
        await billingDispatchTyped(
          {
            op: "deleteById",
            table: "convex_billing_payouts",
            idField: "payoutId",
            idValue: payoutId,
          },
          context,
          configuration
        );
      }
    }
  },
});
