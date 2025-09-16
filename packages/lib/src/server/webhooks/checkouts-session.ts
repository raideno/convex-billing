import { CheckoutSessionStripeToConvex } from "@/schema/checkout-session";
import { billingDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export const CheckoutSessionsWebhooksHandler = defineWebhookHandler({
  events: [
    "checkout.session.async_payment_failed",
    // NOTE: fired when the checkout is completed, not when the payment is successful
    // At this stage, the payment may be still processing or require additional actions
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
        await billingDispatchTyped(
          {
            operation: "upsert",
            table: "convex_billing_checkout_sessions",
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
