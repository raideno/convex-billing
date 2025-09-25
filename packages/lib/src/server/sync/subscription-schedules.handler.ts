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
      if (configuration.sync.stripeSubscriptionschedules !== true) return;

      const stripe = new Stripe(configuration.stripe.secret_key, {
        apiVersion: "2025-08-27.basil",
      });

      const localSubscriptionSchedulesRes = await storeDispatchTyped(
        {
          operation: "selectAll",
          table: "stripeSubscriptionschedules",
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

      const stripeSubscriptionscheduleIds = new Set<string>();

      for (const subscriptionSchedule of subscriptionSchedules) {
        stripeSubscriptionscheduleIds.add(subscriptionSchedule.id);

        await storeDispatchTyped(
          {
            operation: "upsert",
            table: "stripeSubscriptionschedules",
            idField: "subscriptionScheduleId",
            data: {
              subscriptionScheduleId: subscriptionSchedule.id,
              stripe: SubscriptionScheduleStripeToConvex(subscriptionSchedule),
              lastSyncedAt: Date.now(),
            },
          },
          context,
          configuration
        );
      }

      for (const [
        subscriptionScheduleId,
      ] of localSubscriptionSchedulesById.entries()) {
        if (!stripeSubscriptionscheduleIds.has(subscriptionScheduleId)) {
          await storeDispatchTyped(
            {
              operation: "deleteById",
              table: "stripeSubscriptionschedules",
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
