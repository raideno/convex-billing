import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { ChargeStripeToConvex } from "@/schema/charge";
import { storeDispatchTyped } from "@/store";

export const ChargesSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "charges",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripeCharges !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localChargesRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripeCharges",
      },
      context,
      configuration
    );
    const localChargesById = new Map(
      (localChargesRes.docs || []).map((p: any) => [p.chargeId, p])
    );

    const charges = await stripe.charges
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripeChargeIds = new Set<string>();

    for (const charge of charges) {
      stripeChargeIds.add(charge.id);

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripeCharges",
          idField: "chargeId",
          data: {
            chargeId: charge.id,
            stripe: ChargeStripeToConvex(charge),
            lastSyncedAt: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [chargeId] of localChargesById.entries()) {
      if (!stripeChargeIds.has(chargeId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripeCharges",
            idField: "chargeId",
            idValue: chargeId,
          },
          context,
          configuration
        );
      }
    }
  },
});
