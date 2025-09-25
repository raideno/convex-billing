import { v } from "convex/values";
import Stripe from "stripe";

import { SetupImplementation } from "@/actions/setup";
import { buildSignedReturnUrl } from "@/redirects";
import { CheckoutSessionStripeToConvex } from "@/schema/checkout-session";
import { SubscriptionStripeToConvex } from "@/schema/subscription";
import { storeDispatchTyped } from "@/store";

import { defineActionImplementation, metadata } from "../helpers";

const DEFAULT_CREATE_STRIPE_CUSTOMER_IF_MISSING = true;

export const SubscribeImplementation = defineActionImplementation({
  name: "subscriptionCheckout",
  args: v.object({
    createStripeCustomerIfMissing: v.optional(v.boolean()),
    entityId: v.string(),
    priceId: v.string(),
    metadata: v.optional(v.union(metadata(), v.null())),
    success: v.object({
      url: v.string(),
    }),
    cancel: v.object({
      url: v.string(),
    }),
  }),
  handler: async (
    context,
    args,
    configuration
  ): Promise<{ url: string | null }> => {
    const createStripeCustomerIfMissing =
      args.createStripeCustomerIfMissing ??
      DEFAULT_CREATE_STRIPE_CUSTOMER_IF_MISSING;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const stripeCustomer = await storeDispatchTyped(
      {
        operation: "selectOne",
        table: "stripeCustomers",
        field: "entityId",
        value: args.entityId,
      },
      context,
      configuration
    );

    let customerId = stripeCustomer?.doc?.customerId || null;

    if (!customerId) {
      if (!createStripeCustomerIfMissing) {
        throw new Error(
          `No Stripe customer ID found for this entityId: ${args.entityId}`
        );
      } else {
        customerId = (
          await SetupImplementation.handler(
            context,
            {
              entityId: args.entityId,
              email: undefined,
              metadata: undefined,
            },
            configuration
          )
        ).customerId;
      }
    }

    const successUrl = await buildSignedReturnUrl({
      configuration: configuration,
      origin: "subscribe-success",
      data: {
        entityId: args.entityId,
      },
      targetUrl: args.success.url,
    });
    const cancelUrl = await buildSignedReturnUrl({
      configuration: configuration,
      origin: "subscribe-cancel",
      data: {
        entityId: args.entityId,
      },
      targetUrl: args.cancel.url,
    });

    const checkout = await stripe.checkout.sessions.create({
      customer: customerId,
      ui_mode: "hosted",
      mode: "subscription",
      line_items: [
        {
          price: args.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        ...args.metadata,
        entityId: args.entityId,
        customerId: customerId,
      },
      client_reference_id: args.entityId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          entityId: args.entityId,
          customerId: customerId,
        },
      },
      expand: ["subscription"],
    });

    await storeDispatchTyped(
      {
        operation: "upsert",
        table: "stripeCheckoutSessions",
        idField: "checkoutSessionId",
        data: {
          checkoutSessionId: checkout.id,
          stripe: CheckoutSessionStripeToConvex(checkout),
          lastSyncedAt: Date.now(),
        },
      },
      context,
      configuration
    );

    const subscription = checkout.subscription;

    if (
      subscription &&
      subscription !== null &&
      typeof subscription !== "string"
    ) {
      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripeSubscriptions",
          idField: "subscriptionId",
          data: {
            subscriptionId: subscription.id,
            customerId: customerId,
            stripe: SubscriptionStripeToConvex(subscription),
            lastSyncedAt: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    return checkout;
  },
});
