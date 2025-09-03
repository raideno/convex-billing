import { GenericActionCtx, httpActionGeneric } from "convex/server";
import Stripe from "stripe";

import { BillingDataModel } from "../../schema";
import { InternalConfiguration } from "../../types";
import { PricesWebhooksHandler } from "./prices";
import { ProductsWebhooksHandler } from "./products";
import { SubscriptionsWebhooksHandler } from "./subscription";

export const HANDLERS = [
  ProductsWebhooksHandler,
  PricesWebhooksHandler,
  SubscriptionsWebhooksHandler,
] as const;

export const buildWebhookImplementation = (
  configuration: InternalConfiguration
) =>
  httpActionGeneric(async (context_, request) => {
    const context = context_ as unknown as GenericActionCtx<BillingDataModel>;

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

    console.debug("[STRIPE HOOK](RECEIVED):", event.type);

    for (const handler of HANDLERS) {
      if (handler.events.includes(event.type)) {
        // TODO: maybe it should be parallelized ?
        try {
          await handler.handle(event, context, configuration);
          console.debug("[STRIPE HOOK](HANDLED):", event.type);
        } catch (error) {
          console.error("[STRIPE HOOK](Error):", error);
        }
      }
    }

    return new Response("OK", { status: 200 });
  });
