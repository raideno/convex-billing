import { GenericActionCtx } from "convex/server";
import Stripe from "stripe";

import { InternalConfiguration } from "../../helpers";
import { BillingDataModel } from "../../schema";
import { syncAllPricesImplementation } from "../sync";
import { WebhookHandler } from "./types";

export const PricesWebhooksHandler: WebhookHandler = {
  events: ["price.created", "price.updated", "price.deleted"],
  handle: async (
    event: Stripe.Event,
    context: GenericActionCtx<BillingDataModel>,
    configuration: InternalConfiguration
  ) => {
    await syncAllPricesImplementation(context, {}, configuration);
  },
};
