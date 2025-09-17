import { GenericActionCtx, httpActionGeneric } from "convex/server";
import Stripe from "stripe";

import { StripeDataModel } from "@/schema";
import { InternalConfiguration } from "@/types";

import { WebhookHandler } from "./types";

const HANDLERS_MODULES = import.meta.glob("./*.handler.ts", { eager: true });

export const buildWebhookImplementation = (
  configuration: InternalConfiguration
) =>
  httpActionGeneric(async (context_, request) => {
    const HANDLERS = Object.values(HANDLERS_MODULES).map(
      (handler) =>
        (handler as { default: WebhookHandler<Stripe.Event.Type> }).default
    );

    const context = context_ as unknown as GenericActionCtx<StripeDataModel>;

    const body = await request.text();
    const signature = request.headers.get("Stripe-Signature");

    if (!signature) return new Response("No signature", { status: 400 });

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    if (typeof signature !== "string")
      return new Response("Invalid signature", { status: 400 });

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      configuration.stripe.webhook_secret
    );

    configuration.logger.debug(`[STRIPE HOOK](RECEIVED): ${event.type}`);

    for (const handler of HANDLERS) {
      if (handler.events.includes(event.type as never)) {
        try {
          await handler.handle(event as never, context, configuration);
          configuration.logger.debug(`[STRIPE HOOK](HANDLED): ${event.type}`);
        } catch (error) {
          configuration.logger.error(`[STRIPE HOOK](Error): ${error}`);
        }
      }
    }

    return new Response("OK", { status: 200 });
  });
