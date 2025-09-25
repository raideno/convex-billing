import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { PaymentIntentStripeToConvex } from "@/schema/payment-intent";
import { storeDispatchTyped } from "@/store";

export const PaymentIntentsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "paymentIntents",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripePaymentIntents !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localPaymentIntentsRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripePaymentIntents",
      },
      context,
      configuration
    );
    const localPaymentIntentsById = new Map(
      (localPaymentIntentsRes.docs || []).map((p: any) => [
        p.paymentIntentId,
        p,
      ])
    );

    const paymentIntents = await stripe.paymentIntents
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripePaymentIntentIds = new Set<string>();

    for (const paymentIntent of paymentIntents) {
      stripePaymentIntentIds.add(paymentIntent.id);

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripePaymentIntents",
          idField: "paymentIntentId",
          data: {
            paymentIntentId: paymentIntent.id,
            stripe: PaymentIntentStripeToConvex(paymentIntent),
            lastSyncedAt: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [paymentIntentId] of localPaymentIntentsById.entries()) {
      if (!stripePaymentIntentIds.has(paymentIntentId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripePaymentIntents",
            idField: "paymentIntentId",
            idValue: paymentIntentId,
          },
          context,
          configuration
        );
      }
    }
  },
});
