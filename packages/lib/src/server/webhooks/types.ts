import { GenericActionCtx } from "convex/server";
import Stripe from "stripe";

import { StripeDataModel } from "@/schema";
import { InternalConfiguration } from "@/types";

export type WebhookHandler<TEvents extends Stripe.Event.Type> = {
  events: readonly TEvents[];
  handle: (
    event_: Extract<Stripe.Event, { type: TEvents }>,
    context: GenericActionCtx<StripeDataModel>,
    configuration: InternalConfiguration
  ) => Promise<void>;
};

export function defineWebhookHandler<const T extends Stripe.Event.Type>(
  handler: WebhookHandler<T>
): WebhookHandler<T> {
  return handler;
}
