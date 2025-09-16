import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { CheckoutSessionStripeToConvex } from "@/schema/checkout-session";
import { storeDispatchTyped } from "@/store";

export const CheckoutSessionsSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "checkoutSessions",
  handler: async (context, args, configuration) => {
    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localCheckoutSessionsRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "convex_stripe_checkout_sessions",
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
          table: "convex_stripe_checkout_sessions",
          idField: "checkoutSessionId",
          data: {
            checkoutSessionId: checkoutSession.id,
            stripe: CheckoutSessionStripeToConvex(checkoutSession),
            last_synced_at: Date.now(),
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
            table: "convex_stripe_checkout_sessions",
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
