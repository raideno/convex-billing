import { PaymentIntentStripeToConvex } from "@/schema/payment-intent";
import { billingDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export const PaymentIntentsWebhooksHandler = defineWebhookHandler({
  events: [
    "payment_intent.created",
    "payment_intent.amount_capturable_updated",
    "payment_intent.canceled",
    "payment_intent.partially_funded",
    "payment_intent.payment_failed",
    "payment_intent.processing",
    "payment_intent.requires_action",
    "payment_intent.succeeded",
  ],
  handle: async (event, context, configuration) => {
    const paymentIntent = event.data.object;

    switch (event.type) {
      case "payment_intent.created":
      case "payment_intent.amount_capturable_updated":
      case "payment_intent.canceled":
      case "payment_intent.partially_funded":
      case "payment_intent.payment_failed":
      case "payment_intent.processing":
      case "payment_intent.requires_action":
      case "payment_intent.succeeded":
        await billingDispatchTyped(
          {
            operation: "upsert",
            table: "convex_billing_payment_intents",
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
        break;
    }
  },
});
