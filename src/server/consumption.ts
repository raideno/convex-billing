// consumption.ts

import { Implementation } from "./helpers";
import { getSubscriptionImplementation } from "./stripe";

export const getConsumptionImplementation: Implementation<
  {
    entityId: string;
    name: string;
  },
  Promise<{ usage: number; limit: number; remaining: number }>
> = async (context, args, configuration) => {
  const stripeCustomerId =
    await configuration.persistence.getStripeCustomerIdByEntityId(
      context,
      args.entityId
    );

  if (!stripeCustomerId)
    throw new Error("No stripe customerId associated with user.");

  const subscription = await getSubscriptionImplementation(
    context,
    {
      entityId: args.entityId,
    },
    configuration
  );

  if (subscription.status === "none") throw new Error("no_active_subscription");

  const usage = await configuration.persistence.getOrSetupUsage(context, {
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
};

// TODO: get multiple credits usage at once

export const consumeImplementation: Implementation<
  {
    entityId: string;
    amount: number;
    name: string;
    enforce?: boolean;
  },
  Promise<boolean>
> = async (context, args, configuration) => {
  const stripeCustomerId =
    await configuration.persistence.getStripeCustomerIdByEntityId(
      context,
      args.entityId
    );

  if (!stripeCustomerId)
    throw new Error("No stripe customerId associated with user.");

  const subscription = await getSubscriptionImplementation(
    context,
    {
      entityId: args.entityId,
    },
    configuration
  );

  if (subscription.status === "none") throw new Error("no_active_subscription");

  return await configuration.persistence.incrementUsageByAndSetupIfNotAlready(
    context,
    {
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
    }
  );
};
