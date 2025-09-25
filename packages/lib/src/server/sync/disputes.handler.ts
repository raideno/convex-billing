import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { DisputeStripeToConvex } from "@/schema/dispute";
import { storeDispatchTyped } from "@/store";

export const DisputesSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "disputes",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripeDisputes !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localDisputesRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripeDisputes",
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
          table: "stripeDisputes",
          idField: "disputeId",
          data: {
            disputeId: dispute.id,
            stripe: DisputeStripeToConvex(dispute),
            lastSyncedAt: Date.now(),
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
            table: "stripeDisputes",
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
