import { SubscriptionSyncImplementation } from "@/sync/subscription";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: [
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "customer.subscription.paused",
    "customer.subscription.resumed",
    "customer.subscription.pending_update_applied",
    "customer.subscription.pending_update_expired",
    "customer.subscription.trial_will_end",
    "invoice.paid",
    "invoice.payment_failed",
    "invoice.payment_action_required",
    "invoice.upcoming",
    "invoice.marked_uncollectible",
    "invoice.payment_succeeded",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "payment_intent.canceled",
  ],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripe_subscriptions !== true) return;

    const customerId =
      typeof event.data.object.customer === "string"
        ? event.data.object.customer
        : event.data.object.customer?.id;

    if (typeof customerId !== "string")
      throw new Error(`Customer ID ${customerId} isn't string.`);

    await SubscriptionSyncImplementation.handler(
      context,
      { customerId },
      configuration
    );
  },
});
