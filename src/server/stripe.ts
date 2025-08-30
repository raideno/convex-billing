// stripe.ts

import Stripe from "stripe";

import { httpActionGeneric } from "convex/server";

import {
  Implementation,
  InternalConfiguration,
  STRIPE_SUB_CACHE,
} from "./helpers";
import { extractLimitsFromMetadata } from "./limits";

export const getPortalImplementation: Implementation<
  {
    entityId: string;
    returnUrl?: string;
  },
  Promise<{ url: string }>
> = async (context, args, configuration) => {
  const stripe = new Stripe(configuration.stripe.secret_key, {
    apiVersion: "2025-08-27.basil",
  });

  const stripeCustomerId =
    await configuration.persistence.getStripeCustomerIdByEntityId(
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
    return_url: args.returnUrl || configuration.defaults.portal_return_url,
  });

  return { url: portal.url };
};

export const checkoutImplementation: Implementation<
  {
    entityId: string;
    priceId: string;
    successUrl?: string;
    cancelUrl?: string;
    returnUrl?: string;
  },
  Promise<{ url: string | null }>
> = async (context, args, configuration) => {
  const stripe = new Stripe(configuration.stripe.secret_key, {
    apiVersion: "2025-08-27.basil",
  });

  const stripeCustomerId =
    await configuration.persistence.getStripeCustomerIdByEntityId(
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
    success_url: args.successUrl || configuration.defaults.checkout_success_url,
    cancel_url: args.cancelUrl || configuration.defaults.checkout_cancel_url,
    return_url: args.returnUrl || configuration.defaults.checkout_return_url,
  });

  return { url: checkout.url };
};

export const createStripeCustomerImplementation: Implementation<
  {
    entityId: string;
    email?: string;
    metadata?: Record<string, any>;
  },
  Promise<{ stripeCustomerId: string }>
> = async (context, args, configuration) => {
  const stripe = new Stripe(configuration.stripe.secret_key, {
    apiVersion: "2025-08-27.basil",
  });

  let stripeCustomerId =
    await configuration.persistence.getStripeCustomerIdByEntityId(
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

    await configuration.persistence.persistStripeCustomerId(context, {
      stripeCustomerId: stripeCustomer.id,
      entityId: args.entityId,
    });

    stripeCustomerId = stripeCustomer.id;
  }

  return { stripeCustomerId };
};

export const syncImplementation: Implementation<
  {
    stripeCustomerId: string;
  },
  Promise<STRIPE_SUB_CACHE>
> = async (context, args, configuration) => {
  const stripe = new Stripe(configuration.stripe.secret_key, {
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
    await configuration.persistence.persistSubscriptionData(context, {
      stripeCustomerId,
      data,
    });
    return data as STRIPE_SUB_CACHE;
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

  await configuration.persistence.persistSubscriptionData(context, {
    stripeCustomerId,
    data,
  });

  return data;
};

export const getSubscriptionImplementation: Implementation<
  {
    entityId: string;
  },
  Promise<STRIPE_SUB_CACHE>
> = async (context, args, configuration) => {
  const stripeCustomerId =
    await configuration.persistence.getStripeCustomerIdByEntityId(
      context,
      args.entityId
    );

  if (!stripeCustomerId) {
    return { status: "none" } as STRIPE_SUB_CACHE;
  }

  const data =
    await configuration.persistence.getSubscriptionDataByStripeCustomerId(
      context,
      stripeCustomerId
    );

  if (!data) {
    return { status: "none" } as STRIPE_SUB_CACHE;
  }

  return data as STRIPE_SUB_CACHE;
};

export const buildWebhookImplementation = (
  configuration: InternalConfiguration
) =>
  httpActionGeneric(async (context, request) => {
    const body = await request.text();
    const signature = request.headers.get("Stripe-Signature");

    if (!signature) return new Response("No signature", { status: 400 });

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    try {
      if (typeof signature !== "string") {
        return new Response("Invalid signature", { status: 400 });
      }

      const event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        configuration.stripe.webhook_secret
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

      await syncImplementation(
        context,
        { stripeCustomerId: customerId },
        configuration
      );
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
export const getPlansImplementation: Implementation<
  {},
  Promise<
    {
      stripePriceId: string;
      stripeProductId: string;
      name: string;
      description: string | null;
      currency: string;
      amount: number;
      interval: Stripe.Price.Recurring.Interval | undefined;
    }[]
  >
> = async (args, context, configuration) => {
  const stripe = new Stripe(configuration.stripe.secret_key, {
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
};
