import { PlanStripeToConvex } from "@/schema/plan";
import { storeDispatchTyped } from "@/store";

import { defineWebhookHandler } from "./types";

export default defineWebhookHandler({
  events: ["plan.created", "plan.deleted", "plan.updated"],
  handle: async (event, context, configuration) => {
    if (configuration.sync.stripePlans !== true) return;

    const plan = event.data.object;

    switch (event.type) {
      case "plan.created":
      case "plan.updated":
      case "plan.deleted":
        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripePlans",
            idField: "planId",
            data: {
              planId: plan.id,
              stripe: PlanStripeToConvex(plan),
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
