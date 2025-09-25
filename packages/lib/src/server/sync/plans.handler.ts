import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { PlanStripeToConvex } from "@/schema/plan";
import { storeDispatchTyped } from "@/store";

export const PlansSyncImplementation = defineActionImplementation({
  args: v.object({}),
  name: "plans",
  handler: async (context, args, configuration) => {
    if (configuration.sync.stripePlans !== true) return;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const localPlansRes = await storeDispatchTyped(
      {
        operation: "selectAll",
        table: "stripePlans",
      },
      context,
      configuration
    );
    const localPlansById = new Map(
      (localPlansRes.docs || []).map((p: any) => [p.planId, p])
    );

    const plans = await stripe.plans
      .list({ limit: 100, expand: ["data.product"] })
      .autoPagingToArray({ limit: 10_000 });

    const stripePlanIds = new Set<string>();

    for (const plan of plans) {
      stripePlanIds.add(plan.id);

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
    }

    for (const [planId] of localPlansById.entries()) {
      if (!stripePlanIds.has(planId)) {
        await storeDispatchTyped(
          {
            operation: "deleteById",
            table: "stripePlans",
            idField: "planId",
            idValue: planId,
          },
          context,
          configuration
        );
      }
    }
  },
});
