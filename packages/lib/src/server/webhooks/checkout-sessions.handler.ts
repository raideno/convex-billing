import { CheckoutSessionStripeToConvex } from "@/schema/checkout-session";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: [
    "checkout.session.async_payment_failed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.completed",
    "checkout.session.expired",
  ],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripeCheckoutSessions !== true) return;

    const checkoutSession = event.data.object;

    switch (event.type) {
      case "checkout.session.async_payment_failed":
      case "checkout.session.async_payment_succeeded":
      case "checkout.session.expired":
      case "checkout.session.completed":
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
        break;
    }
  },
});
