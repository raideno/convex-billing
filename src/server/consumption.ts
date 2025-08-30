// TODO: right now credits are per subscription and thus reset at each billing period
// We could have a concept of lifetime credits that don't reset such as an organization that have a limit of file storage or something like that

// consumption.ts

import { Implementation } from "./helpers";
import { getSubscriptionImplementation } from "./stripe";

export const getConsumptionImplementation: Implementation<{
  entityId: string;
  name: string;
}> = async (args, kv, context, configuration) => {
  const stripeCustomerId = await kv.getStripeCustomerIdByEntityId(
    context,
    args.entityId
  );

  if (!stripeCustomerId)
    throw new Error("No stripe customerId associated with user.");

  const subscription = await getSubscriptionImplementation(
    {
      entityId: args.entityId,
    },
    kv,
    context,
    configuration
  );

  if (subscription.status === "none") throw new Error("no_active_subscription");

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
};

// TODO: get multiple credits usage at once

export const consumeImplementation: Implementation<{
  entityId: string;
  amount: number;
  name: string;
  enforce?: boolean;
}> = async (args, kv, context, configuration) => {
  const stripeCustomerId = await kv.getStripeCustomerIdByEntityId(
    context,
    args.entityId
  );

  if (!stripeCustomerId)
    throw new Error("No stripe customerId associated with user.");

  const subscription = await getSubscriptionImplementation(
    {
      entityId: args.entityId,
    },
    kv,
    context,
    configuration
  );

  if (subscription.status === "none") throw new Error("no_active_subscription");

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
};
