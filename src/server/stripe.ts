// stripe.ts

import Stripe from "stripe";

import { v } from "convex/values";
import { httpActionGeneric, internalActionGeneric } from "convex/server";

import { extractLimitsFromMetadata } from "./limits";
import {
  Configuration,
  ConvexFunctionFactory,
  STRIPE_SUB_CACHE,
} from "./helpers";
import { Context, Persistence } from "./persistence";

export const buildPortal: ConvexFunctionFactory = (configuration, kv) =>
  internalActionGeneric({
    args: {
      entityId: v.string(),
      returnUrl: v.optional(v.string()),
    },
    handler: async (context, args) => {
      const stripe = new Stripe(configuration.stripe_secret_key, {
        apiVersion: "2025-08-27.basil",
      });

      const stripeCustomerId = await kv.getStripeCustomerIdByEntityId(
        context,
        args.entityId
      );

      if (!stripeCustomerId) {
        throw new Error(
          "No Stripe customer ID found for this entityId: " + args.entityId
        );
      }

      const portal = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: args.returnUrl || configuration.default_portal_return_url,
      });

      return { url: portal.url };
    },
  });

export const buildCheckout: ConvexFunctionFactory = (configuration, kv) =>
  internalActionGeneric({
    args: {
      entityId: v.string(),
      priceId: v.string(),
      successUrl: v.optional(v.string()),
      cancelUrl: v.optional(v.string()),
      returnUrl: v.optional(v.string()),
    },
    handler: async (context, args) => {
      const stripe = new Stripe(configuration.stripe_secret_key, {
        apiVersion: "2025-08-27.basil",
      });

      const stripeCustomerId = await kv.getStripeCustomerIdByEntityId(
        context,
        args.entityId
      );

      if (!stripeCustomerId) {
        throw new Error(
          "No Stripe customer ID found for this entityId: " + args.entityId
        );
      }

      const checkout = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        ui_mode: "hosted",
        mode: "subscription",
        line_items: [
          {
            price: args.priceId,
            quantity: 1,
          },
        ],
        success_url:
          args.successUrl || configuration.default_checkout_success_url,
        cancel_url: args.cancelUrl || configuration.default_checkout_cancel_url,
        return_url: args.returnUrl || configuration.default_checkout_return_url,
      });

      return { url: checkout.url };
    },
  });

export const buildCreateStripeCustomer: ConvexFunctionFactory = (
  configuration,
  kv
) =>
  internalActionGeneric({
    args: {
      entityId: v.string(),
      email: v.optional(v.string()),
      metadata: v.optional(v.record(v.string(), v.any())),
    },
    handler: async (context, args) => {
      const stripe = new Stripe(configuration.stripe_secret_key, {
        apiVersion: "2025-08-27.basil",
      });

      let stripeCustomerId = await kv.getStripeCustomerIdByEntityId(
        context,
        args.entityId
      );

      if (stripeCustomerId) {
        return { stripeCustomerId };
      }

      if (!stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
          email: args.email,
          metadata: {
            entityId: args.entityId,
            ...(args.metadata || {}),
          },
        });

        await kv.persistStripeCustomerId(context, {
          stripeCustomerId: stripeCustomer.id,
          entityId: args.entityId,
        });

        stripeCustomerId = stripeCustomer.id;
      }

      return { stripeCustomerId };
    },
  });

export const sync_ = async (
  kv: Persistence,
  context: Context,
  configuration: Configuration,
  args: { stripeCustomerId: string }
) => {
  const stripe = new Stripe(configuration.stripe_secret_key, {
    apiVersion: "2025-08-27.basil",
  });

  const stripeCustomerId = args.stripeCustomerId;

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    limit: 1,
    status: "all",
    expand: ["data.default_payment_method"],
  });

  if (subscriptions.data.length === 0) {
    const data = { status: "none" };
    await kv.persistSubscriptionData(context, {
      stripeCustomerId,
      data,
    });
    return data;
  }

  // TODO: here we select the first cuz entities can only have one subscription
  const subscription = subscriptions.data[0];

  const limits = extractLimitsFromMetadata(
    configuration,
    subscription.items.data[0].price.metadata
  );

  const data: STRIPE_SUB_CACHE = {
    subscriptionId: subscription.id,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
    // TODO: be sure of the items thing
    currentPeriodEnd: subscription.items.data[0].current_period_end,
    // TODO: be sure of the items thing
    currentPeriodStart: subscription.items.data[0].current_period_start,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    limits: limits,
    paymentMethod:
      subscription.default_payment_method &&
      typeof subscription.default_payment_method !== "string"
        ? {
            brand: subscription.default_payment_method.card?.brand ?? null,
            last4: subscription.default_payment_method.card?.last4 ?? null,
          }
        : null,
  };

  await kv.persistSubscriptionData(context, {
    stripeCustomerId,
    data,
  });

  return data;
};

export const buildSync: ConvexFunctionFactory = (configuration, kv) =>
  internalActionGeneric({
    args: { stripeCustomerId: v.string() },
    handler: async (context, args) => {
      return await sync_(kv, context, configuration, {
        stripeCustomerId: args.stripeCustomerId,
      });
    },
  });

export const subscription_ = async (
  kv: Persistence,
  context: Context,
  configuration: Configuration,
  args: { entityId: string }
) => {
  const stripeCustomerId = await kv.getStripeCustomerIdByEntityId(
    context,
    args.entityId
  );

  if (!stripeCustomerId) {
    return { status: "none" } as STRIPE_SUB_CACHE;
  }

  const data = await kv.getSubscriptionDataByStripeCustomerId(
    context,
    stripeCustomerId
  );

  if (!data) {
    return { status: "none" } as STRIPE_SUB_CACHE;
  }

  return data as STRIPE_SUB_CACHE;
};

export const buildSubscription: ConvexFunctionFactory = (configuration, kv) =>
  internalActionGeneric({
    args: {
      entityId: v.string(),
    },
    handler: async (context, args) => {
      return await subscription_(kv, context, configuration, {
        entityId: args.entityId,
      });
    },
  });

export const buildWebhook: ConvexFunctionFactory = (configuration, kv) =>
  httpActionGeneric(async (context, request) => {
    const body = await request.text();
    const signature = request.headers.get("Stripe-Signature");

    if (!signature) return new Response("No signature", { status: 400 });

    const stripe = new Stripe(configuration.stripe_secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    try {
      if (typeof signature !== "string") {
        return new Response("Invalid signature", { status: 400 });
      }

      const event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        configuration.stripe_webhook_secret
      );

      if (!allowedEvents.includes(event.type))
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

      await sync_(kv, context, configuration, { stripeCustomerId: customerId });
    } catch (error) {
      console.error("[STRIPE HOOK](Error):", error);

      return new Response("Webhook Error", { status: 400 });
    }

    return new Response("OK", { status: 200 });
  });

const allowedEvents: Stripe.Event.Type[] = [
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

// TODO: expose the limits and features metadata, like transform them
export const buildPlans: ConvexFunctionFactory = (configuration, kv) =>
  internalActionGeneric({
    args: {},
    handler: async (ctx, args) => {
      const stripe = new Stripe(configuration.stripe_secret_key, {
        apiVersion: "2025-08-27.basil",
      });

      // const products = await stripe.products.list({
      //   active: true,
      //   limit: 100,
      // });

      // TODO: instead return the products with their prices expanded
      const prices = await stripe.prices.list({
        active: true,
        limit: 100,
        expand: ["data.product"],
      });

      const plans = prices.data.map((price) => {
        const product = price.product as Stripe.Product;
        return {
          stripePriceId: price.id,
          stripeProductId: product.id,
          name: product.name,
          description: product.description,
          currency: price.currency,
          // NOTE: we divide by 100 cuz Stripe stores prices in the smallest currency unit (e.g., cents for USD)
          amount: (price.unit_amount || 0) / 100,
          interval: price.recurring?.interval, // "month" | "year"
        };
      });

      return plans;
    },
  });
