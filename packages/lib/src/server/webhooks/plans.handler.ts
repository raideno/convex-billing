import { PlanStripeToConvex } from "@/schema/plan";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: ["plan.created", "plan.deleted", "plan.updated"],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripe_plans !== true) return;

    const plan = event.data.object;

    switch (event.type) {
      case "plan.created":
      case "plan.updated":
      case "plan.deleted":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripe_plans",
            idField: "planId",
            data: {
              planId: plan.id,
              stripe: PlanStripeToConvex(plan),
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
