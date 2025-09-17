import Stripe from "stripe";
import { v } from "convex/values";

import { defineActionImplementation } from "@/helpers";
import { PayoutStripeToConvex } from "@/schema/payout";
import { storeDispatchTyped } from "@/store";

export const PayoutsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "payouts",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripe_payouts !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localPayoutsRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripe_payouts",
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

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripe_payouts",
          idField: "payoutId",
          data: {
            payoutId: payout.id,
            stripe: PayoutStripeToConvex(payout),
            last_synced_at: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [payoutId] of localPayoutsById.entries()) {
      if (!stripePayoutIds.has(payoutId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripe_payouts",
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
