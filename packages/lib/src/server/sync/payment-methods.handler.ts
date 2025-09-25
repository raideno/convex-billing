import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { PaymentMethodStripeToConvex } from "@/schema/payment-method";
import { storeDispatchTyped } from "@/store";

export const PaymentMethodsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "paymentMethods",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripePaymentMethods !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localPaymentMethodsRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripePaymentMethods",
      },
      context,
      configuration
    );
    const localPaymentMethodsById = new Map(
      (localPaymentMethodsRes.docs || []).map((p: any) => [
        p.paymentMethodId,
        p,
      ])
    );

    const paymentMethods = await stripe.paymentMethods
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripePaymentMethodIds = new Set<string>();

    for (const paymentMethod of paymentMethods) {
      stripePaymentMethodIds.add(paymentMethod.id);

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripePaymentMethods",
          idField: "paymentMethodId",
          data: {
            paymentMethodId: paymentMethod.id,
            stripe: PaymentMethodStripeToConvex(paymentMethod),
            lastSyncedAt: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [paymentMethodId] of localPaymentMethodsById.entries()) {
      if (!stripePaymentMethodIds.has(paymentMethodId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripePaymentMethods",
            idField: "paymentMethodId",
            idValue: paymentMethodId,
          },
          context,
          configuration
        );
      }
    }
  },
});
