import { httpActionGeneric } from "convex/server";
import Stripe from "stripe";

import { InternalConfiguration } from "../helpers";
import { syncImplementation } from "./sync";

export const STRIPE_ALLOWED_EVENTS: Stripe.Event.Type[] = [
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
];

export const buildWebhookImplementation = (
  configuration: InternalConfiguration
) =>
  httpActionGeneric(async (context, request) => {
    const body = await request.text();
    const signature = request.headers.get("Stripe-Signature");

    if (!signature) return new Response("No signature", { status: 400 });

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    try {
      if (typeof signature !== "string") {
        return new Response("Invalid signature", { status: 400 });
      }

      const event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        configuration.stripe.webhook_secret
      );

      if (!STRIPE_ALLOWED_EVENTS.includes(event.type))
        return new Response("OK", { status: 200 });

      // All the events I track have a customerId
      const { customer: customerId } = event?.data?.object as {
        customer: string; // Sadly TypeScript does not know this
      };

      // This helps make it typesafe and also lets me know if my assumption is wrong
      if (typeof customerId !== "string") {
        throw new Error(
          `[STRIPE HOOK][CANCER] ID isn't string.\nEvent type: ${event.type}`
        );
      }

      await syncImplementation(
        context,
        { stripeCustomerId: customerId },
        configuration
      );
    } catch (error) {
      console.error("[STRIPE HOOK](Error):", error);

      return new Response("Webhook Error", { status: 400 });
    }

    return new Response("OK", { status: 200 });
  });
