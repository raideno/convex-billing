import { GenericActionCtx } from "convex/server";
import Stripe from "stripe";

import { StripeDataModel } from "@/schema";
import { InternalConfiguration } from "@/types";

import { WebhookHandler } from "./types";

const HANDLERS_MODULES = Object.values(
  import.meta.glob("./*.handler.ts", {
    eager: true,
  })
) as unknown as Array<Record<string, WebhookHandler<Stripe.Event.Type>>>;

if (HANDLERS_MODULES.some((handler) => Object.keys(handler).length > 1)) {
  throw new Error(
    "Each handler file should only have one export / default export"
  );
}

// TODO: add a compile time check to make sure the thing is of type ReturnType<typeof defineActionImplementation>
const HANDLERS = HANDLERS_MODULES.map((exports) => Object.values(exports)[0]);

export const webhookImplementation = async (
  configuration: InternalConfiguration,
  context: GenericActionCtx<StripeDataModel>,
  request: Request,
  stripe_?: Stripe
) => {
  const body = await request.text();
  const signature = request.headers.get("Stripe-Signature");

  if (!signature) return new Response("No signature", { status: 400 });

  const stripe = stripe_
    ? stripe_
    : new Stripe(configuration.stripe.secret_key, {
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
};
