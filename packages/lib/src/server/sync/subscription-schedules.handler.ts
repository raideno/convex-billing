import { v } from "convex/values";
import Stripe from "stripe";

import { defineActionImplementation } from "@/helpers";
import { SubscriptionScheduleStripeToConvex } from "@/schema/subscription-schedule";
import { storeDispatchTyped } from "@/store";

export const SubscriptionSchedulesSyncImplementation =
  defineActionImplementation({
    args: v.object({}),
    name: "subscriptionSchedules",
    handler: async (context, args, configuration) => {
      if (configuration.sync.stripe_subscription_schedules !== true) return;

      const stripe = new Stripe(configuration.stripe.secret_key, {
        apiVersion: "2025-08-27.basil",
      });

      const localSubscriptionSchedulesRes = await storeDispatchTyped(
        {
          operation: "selectAll",
          table: "stripe_subscription_schedules",
        },
        context,
        configuration
      );
      const localSubscriptionSchedulesById = new Map(
        (localSubscriptionSchedulesRes.docs || []).map((p: any) => [
          p.subscriptionScheduleId,
          p,
        ])
      );

      const subscriptionSchedules = await stripe.subscriptionSchedules
        .list({ limit: 100 })
        .autoPagingToArray({ limit: 10_000 });

      const stripeSubscriptionScheduleIds = new Set<string>();

      for (const subscriptionSchedule of subscriptionSchedules) {
        stripeSubscriptionScheduleIds.add(subscriptionSchedule.id);

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
      }

      for (const [
        subscriptionScheduleId,
      ] of localSubscriptionSchedulesById.entries()) {
        if (!stripeSubscriptionScheduleIds.has(subscriptionScheduleId)) {
          await storeDispatchTyped(
            {
              operation: "deleteById",
              table: "stripe_subscription_schedules",
              idField: "subscriptionScheduleId",
              idValue: subscriptionScheduleId,
            },
            context,
            configuration
          );
        }
      }
    },
  });
