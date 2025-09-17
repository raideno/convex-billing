import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { DisputeStripeToConvex } from "@/schema/dispute";
import { storeDispatchTyped } from "@/store";

export const DisputesSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "disputes",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripe_disputes !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localDisputesRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripe_disputes",
      },
      context,
      configuration
    );
    const localDisputesById = new Map(
      (localDisputesRes.docs || []).map((p: any) => [p.disputeId, p])
    );

    const disputes = await stripe.disputes
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripeDisputeIds = new Set<string>();

    for (const dispute of disputes) {
      stripeDisputeIds.add(dispute.id);

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripe_disputes",
          idField: "disputeId",
          data: {
            disputeId: dispute.id,
            stripe: DisputeStripeToConvex(dispute),
            last_synced_at: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [disputeId] of localDisputesById.entries()) {
      if (!stripeDisputeIds.has(disputeId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripe_disputes",
            idField: "disputeId",
            idValue: disputeId,
          },
          context,
          configuration
        );
      }
    }
  },
});
