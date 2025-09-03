import { GenericActionCtx } from "convex/server";
import Stripe from "stripe";

import { BillingDataModel } from "../../schema";
import { InternalConfiguration } from "../../types";
import { syncSubscriptionImplementation } from "../sync-subscription";
import { WebhookHandler } from "./types";

export const SubscriptionsWebhooksHandler: WebhookHandler = {
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
  handle: async (
    event: Stripe.Event,
    context: GenericActionCtx<BillingDataModel>,
    configuration: InternalConfiguration
  ) => {
    const { customer: customerId } = event?.data?.object as {
      customer: string;
    };

    if (typeof customerId !== "string")
      throw new Error(`Customer ID ${customerId} isn't string.`);

    await syncSubscriptionImplementation.handler(
      context,
      { stripeCustomerId: customerId },
      configuration
    );
  },
};
