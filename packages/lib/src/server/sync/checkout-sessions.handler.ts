import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { CheckoutSessionStripeToConvex } from "@/schema/checkout-session";
import { storeDispatchTyped } from "@/store";

export const CheckoutSessionsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "checkoutSessions",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripeCheckoutSessions !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localCheckoutSessionsRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripeCheckoutSessions",
      },
      context,
      configuration
    );
    const localCheckoutSessionsById = new Map(
      (localCheckoutSessionsRes.docs || []).map((p: any) => [
        p.checkoutSessionId,
        p,
      ])
    );

    const checkoutSessions = await stripe.checkout.sessions
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 10_000 });

    const stripeCheckoutSessionIds = new Set<string>();

    for (const checkoutSession of checkoutSessions) {
      stripeCheckoutSessionIds.add(checkoutSession.id);

      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripeCheckoutSessions",
          idField: "checkoutSessionId",
          data: {
            checkoutSessionId: checkoutSession.id,
            stripe: CheckoutSessionStripeToConvex(checkoutSession),
            lastSyncedAt: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    for (const [checkoutSessionId] of localCheckoutSessionsById.entries()) {
      if (!stripeCheckoutSessionIds.has(checkoutSessionId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripeCheckoutSessions",
            idField: "checkoutSessionId",
            idValue: checkoutSessionId,
          },
          context,
          configuration
        );
      }
    }
  },
});
