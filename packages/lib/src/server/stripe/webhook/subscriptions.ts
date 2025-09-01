import { GenericActionCtx } from "convex/server";
import Stripe from "stripe";

import { InternalConfiguration } from "../../helpers";
import { BillingDataModel } from "../../schema";
import { syncSubscriptionImplementation } from "../sync";
import { WebhookHandler } from "./types";

export const SubscriptionsWebhookHandler: WebhookHandler = {
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
      customer: string; // Sadly TypeScript does not know this
    };

    // This helps make it typesafe and also lets me know if my assumption is wrong
    if (typeof customerId !== "string") {
      throw new Error(
        `[STRIPE HOOK][CANCER] ID isn't string.\nEvent type: ${event.type}`
      );
    }

    await syncSubscriptionImplementation(
      context,
      { stripeCustomerId: customerId },
      configuration
    );
  },
};
