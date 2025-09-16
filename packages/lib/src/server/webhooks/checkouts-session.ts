import { CheckoutSessionStripeToConvex } from "@/schema/checkout-session";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export const CheckoutSessionsWebhooksHandler = defineWebhookHandler({
  events: [
    "checkout.session.async_payment_failed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.completed",
    "checkout.session.expired",
  ],
  handle: async (event, context, configuration) => {
    const checkout = event.data.object;

    switch (event.type) {
      case "checkout.session.async_payment_failed":
      case "checkout.session.async_payment_succeeded":
      case "checkout.session.expired":
      case "checkout.session.completed":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "convex_stripe_checkout_sessions",
            idField: "checkoutSessionId",
            data: {
              checkoutSessionId: checkout.id,
              stripe: CheckoutSessionStripeToConvex(checkout),
              last_synced_at: Date.now(),
            },
          },
          context,
          configuration
        );
        break;
    }
  },
});
