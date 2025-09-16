import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { PaymentIntentStripeToConvex } from "@/schema/payment-intent";
import { storeDispatchTyped } from "@/store";

export const PaymentIntentsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "paymentIntents",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localPaymentIntentsRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "convex_stripe_payment_intents",
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
          table: "convex_stripe_payment_intents",
          idField: "paymentIntentId",
          data: {
            paymentIntentId: paymentIntent.id,
            stripe: PaymentIntentStripeToConvex(paymentIntent),
            last_synced_at: Date.now(),
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
            table: "convex_stripe_payment_intents",
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
