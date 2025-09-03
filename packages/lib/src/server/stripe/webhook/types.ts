import { GenericActionCtx } from "convex/server";
import Stripe from "stripe";

import { BillingDataModel } from "../../schema";
import { InternalConfiguration } from "../../types";

export type WebhookHandler = {
  events: Stripe.Event.Type[];
  handle: (
    event: Stripe.Event,
    context: GenericActionCtx<BillingDataModel>,
    configuration: InternalConfiguration
  ) => Promise<void>;
};
