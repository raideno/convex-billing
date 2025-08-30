// TODO: right now credits are per subscription and thus reset at each billing period
// We could have a concept of lifetime credits that don't reset such as an organization that have a limit of file storage or something like that

// usage.ts

import { v } from "convex/values";
import { internalActionGeneric } from "convex/server";

import { subscription_ } from "./stripe";

import { ConvexFunctionFactory } from "./helpers";

export const buildGet: ConvexFunctionFactory = (configuration, kv) =>
  internalActionGeneric({
    args: {
      entityId: v.string(),
      name: v.string(),
    },
    handler: async (
      context,
      args
    ): Promise<{ usage: number; limit: number; remaining: number }> => {
      const stripeCustomerId = await kv.getStripeCustomerIdByEntityId(
        context,
        args.entityId
      );

      if (!stripeCustomerId)
        throw new Error("No stripe customerId associated with user.");

      const subscription = await subscription_(kv, context, configuration, {
        entityId: args.entityId,
      });

      if (subscription.status === "none")
        throw new Error("no_active_subscription");

      const usage = await kv.getOrSetupUsage(context, {
        name: args.name,
        stripeCustomerId: stripeCustomerId,
        period: {
          start: subscription.currentPeriodStart,
          end: subscription.currentPeriodEnd,
        },
      });

      const limit = subscription.limits[args.name];

      const remaining = limit - usage;

      return { usage, limit, remaining };
    },
  });

// TODO: get multiple credits usage at once

export const buildConsume: ConvexFunctionFactory = (configuration, kv) =>
  internalActionGeneric({
    // NOTE: name is for the name of the credit being consumed
    args: {
      entityId: v.string(),
      amount: v.number(),
      name: v.string(),
      enforce: v.optional(v.boolean()),
    },
    handler: async (context, args): Promise<boolean> => {
      const stripeCustomerId = await kv.getStripeCustomerIdByEntityId(
        context,
        args.entityId
      );

      if (!stripeCustomerId)
        throw new Error("No stripe customerId associated with user.");

      const subscription = await subscription_(kv, context, configuration, {
        entityId: args.entityId,
      });

      if (subscription.status === "none")
        throw new Error("no_active_subscription");

      return await kv.incrementUsageByAndSetupIfNotAlready(context, {
        stripeCustomerId,
        period: {
          start: subscription.currentPeriodStart,
          end: subscription.currentPeriodEnd,
        },
        limit: args.enforce
          ? {
              value: subscription.limits[args.name],
              inclusive: true,
            }
          : undefined,
        amount: args.amount,
        name: args.name,
      });
    },
  });
