import { GenericActionCtx } from "convex/server";
import Stripe from "stripe";

import { InternalConfiguration } from "../../helpers";
import { BillingDataModel } from "../../schema";

export type WebhookHandler = {
  events: Stripe.Event.Type[];
  handle: (
    event: Stripe.Event,
    context: GenericActionCtx<BillingDataModel>,
    configuration: InternalConfiguration
  ) => Promise<void>;
};
