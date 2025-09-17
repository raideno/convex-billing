import { GenericActionCtx, httpActionGeneric } from "convex/server";
import Stripe from "stripe";

import { StripeDataModel } from "@/schema";
import { InternalConfiguration } from "@/types";

import { CheckoutSessionsWebhooksHandler } from "./checkouts-session";
import { CouponsWebhooksHandler } from "./coupons";
import { CustomersWebhookHandler } from "./customers";
import { InvoicesWebhooksHandler } from "./invoices";
import { PaymentIntentsWebhooksHandler } from "./payment-intents";
import { PayoutsWebhooksHandler } from "./payouts";
import { PricesWebhooksHandler } from "./prices";
import { ProductsWebhooksHandler } from "./products";
import { PromotionCodesWebhooksHandler } from "./promotion-codes";
import { RefundsWebhooksHandler } from "./refunds";
import { SubscriptionsWebhooksHandler } from "./subscription";

export const buildWebhookImplementation = (
  configuration: InternalConfiguration
) =>
  httpActionGeneric(async (context_, request) => {
    const HANDLERS = [
      ...(configuration.sync.convex_stripe_refunds === true
        ? [RefundsWebhooksHandler]
        : []),
      ...(configuration.sync.convex_stripe_products === true
        ? [ProductsWebhooksHandler]
        : []),
      ...(configuration.sync.convex_stripe_prices === true
        ? [PricesWebhooksHandler]
        : []),
      ...(configuration.sync.convex_stripe_subscriptions === true
        ? [SubscriptionsWebhooksHandler]
        : []),
      ...(configuration.sync.convex_stripe_customers === true
        ? [CustomersWebhookHandler]
        : []),
      ...(configuration.sync.convex_stripe_promotion_codes === true
        ? [PromotionCodesWebhooksHandler]
        : []),
      ...(configuration.sync.convex_stripe_coupons === true
        ? [CouponsWebhooksHandler]
        : []),
      ...(configuration.sync.convex_stripe_payouts === true
        ? [PayoutsWebhooksHandler]
        : []),
      ...(configuration.sync.convex_stripe_checkout_sessions === true
        ? [CheckoutSessionsWebhooksHandler]
        : []),
      ...(configuration.sync.convex_stripe_payment_intents === true
        ? [PaymentIntentsWebhooksHandler]
        : []),
      ...(configuration.sync.convex_stripe_invoices === true
        ? [InvoicesWebhooksHandler]
        : []),
    ] as const;

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
