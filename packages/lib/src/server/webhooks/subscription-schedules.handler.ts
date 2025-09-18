import { SubscriptionScheduleStripeToConvex } from "@/schema/subscription-schedule";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: [
    "subscription_schedule.aborted",
    "subscription_schedule.canceled",
    "subscription_schedule.completed",
    "subscription_schedule.created",
    "subscription_schedule.expiring",
    "subscription_schedule.released",
    "subscription_schedule.updated",
  ],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripe_subscription_schedules !== true) return;

    const subscriptionSchedule = event.data.object;

    switch (event.type) {
      case "subscription_schedule.aborted":
      case "subscription_schedule.canceled":
      case "subscription_schedule.completed":
      case "subscription_schedule.created":
      case "subscription_schedule.expiring":
      case "subscription_schedule.released":
      case "subscription_schedule.updated":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripe_subscription_schedules",
            idField: "subscriptionScheduleId",
            data: {
              subscriptionScheduleId: subscriptionSchedule.id,
              stripe: SubscriptionScheduleStripeToConvex(subscriptionSchedule),
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
