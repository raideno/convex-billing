import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { SetupIntentStripeToConvex } from "@/schema/setup-intent";
import { storeDispatchTyped } from "@/store";

export const SetupIntentsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "setupIntents",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripeSetupIntents !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localSetupIntentsRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripeSetupIntents",
      },
      context,
      configuration
    );
    const localSetupIntentsById = new Map(
      (localSetupIntentsRes.docs || []).map((p: any) => [p.setupIntentId, p])
    );

    const setupIntents = await stripe.setupIntents
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripeSetupIntentIds = new Set<string>();

    for (const setupIntent of setupIntents) {
      stripeSetupIntentIds.add(setupIntent.id);

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripeSetupIntents",
          idField: "setupIntentId",
          data: {
            setupIntentId: setupIntent.id,
            stripe: SetupIntentStripeToConvex(setupIntent),
            lastSyncedAt: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [setupIntent] of localSetupIntentsById.entries()) {
      if (!stripeSetupIntentIds.has(setupIntent)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripeSetupIntents",
            idField: "setupIntentId",
            idValue: setupIntent,
          },
          context,
          configuration
        );
      }
    }
  },
});
