import { GenericActionCtx } from "convex/server";
import Stripe from "stripe";

import { BillingDataModel } from "../../schema";
import { InternalConfiguration } from "../../types";
import { syncAllProductsImplementation } from "../sync";
import { WebhookHandler } from "./types";

export const ProductsWebhookHandler: WebhookHandler = {
  events: ["product.created", "product.updated", "product.deleted"],
  handle: async (
    event: Stripe.Event,
    context: GenericActionCtx<BillingDataModel>,
    configuration: InternalConfiguration
  ) => {
    await syncAllProductsImplementation.handler(context, {}, configuration);
  },
};
