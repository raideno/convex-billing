import { PaymentMethodStripeToConvex } from "@/schema/payment-method";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: [
    "payment_method.attached",
    "payment_method.automatically_updated",
    "payment_method.detached",
    "payment_method.updated",
  ],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripePaymentMethods !== true) return;

    const paymentMethod = event.data.object;

    switch (event.type) {
      case "payment_method.attached":
      case "payment_method.automatically_updated":
      case "payment_method.detached":
      case "payment_method.updated":
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
        break;
    }
  },
});
