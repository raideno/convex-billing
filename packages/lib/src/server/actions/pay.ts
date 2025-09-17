import { v } from "convex/values";
import Stripe from "stripe";

import { SetupImplementation } from "@/actions/setup";
import { buildSignedReturnUrl } from "@/redirects";
import { CheckoutSessionStripeToConvex } from "@/schema/checkout-session";
import { PaymentIntentStripeToConvex } from "@/schema/payment-intent";
import { storeDispatchTyped } from "@/store";

import { defineActionImplementation, metadata } from "../helpers";

const DEFAULT_CREATE_STRIPE_CUSTOMER_IF_MISSING = true;

export const LineItemSchema = v.union(
  v.object({
    adjustable_quantity: v.optional(
      v.object({
        enabled: v.boolean(),
        maximum: v.optional(v.number()),
        minimum: v.optional(v.number()),
      })
    ),
    price: v.string(),
    quantity: v.optional(v.number()),
    tax_rates: v.optional(v.array(v.string())),
    dynamic_tax_rates: v.optional(v.array(v.string())),
  }),
  v.object({
    adjustable_quantity: v.optional(
      v.object({
        enabled: v.boolean(),
        maximum: v.optional(v.number()),
        minimum: v.optional(v.number()),
      })
    ),
    price_data: v.union(
      v.object({
        currency: v.string(),
        productId: v.string(),
        recurring: v.optional(
          v.object({
            interval: v.union(
              v.literal("day"),
              v.literal("week"),
              v.literal("month"),
              v.literal("year")
            ),
            interval_count: v.optional(v.number()),
          })
        ),
        tax_behavior: v.optional(
          v.union(
            v.literal("exclusive"),
            v.literal("inclusive"),
            v.literal("unspecified")
          )
        ),
        unit_amount: v.number(),
      }),
      v.object({
        currency: v.string(),
        product_data: v.object({
          description: v.optional(v.string()),
          images: v.optional(v.array(v.string())),
          metadata: metadata(),
          name: v.string(),
          tax_code: v.optional(v.string()),
        }),
        recurring: v.optional(
          v.object({
            interval: v.union(
              v.literal("day"),
              v.literal("week"),
              v.literal("month"),
              v.literal("year")
            ),
            interval_count: v.optional(v.number()),
          })
        ),
        tax_behavior: v.optional(
          v.union(
            v.literal("exclusive"),
            v.literal("inclusive"),
            v.literal("unspecified")
          )
        ),
        unit_amount: v.number(),
      })
    ),
    quantity: v.optional(v.number()),
    tax_rates: v.optional(v.array(v.string())),
    dynamic_tax_rates: v.optional(v.array(v.string())),
  })
);

export const PayImplementation = defineActionImplementation({
  name: "pay",
  args: v.object({
    createStripeCustomerIfMissing: v.optional(v.boolean()),
    entityId: v.string(),
    metadata: v.optional(v.union(metadata(), v.null())),
    referenceId: v.string(),
    line_items: v.array(LineItemSchema),
    success: v.object({
      url: v.string(),
    }),
    cancel: v.object({
      url: v.string(),
    }),
  }),
  handler: async (context, args, configuration) => {
    const createStripeCustomerIfMissing =
      args.createStripeCustomerIfMissing ??
      DEFAULT_CREATE_STRIPE_CUSTOMER_IF_MISSING;

    const stripe = new Stripe(configuration.stripe.secret_key, {
      apiVersion: "2025-08-27.basil",
    });

    const stripeCustomer = await storeDispatchTyped(
      {
        operation: "selectOne",
        table: "stripe_customers",
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
      origin: "pay-success",
      data: {
        entityId: args.entityId,
        referenceId: args.referenceId,
        customerId: customerId,
      },
      targetUrl: args.success.url,
    });
    const cancelUrl = await buildSignedReturnUrl({
      configuration: configuration,
      origin: "pay-cancel",
      data: {
        entityId: args.entityId,
        referenceId: args.referenceId,
        customerId: customerId,
      },
      targetUrl: args.cancel.url,
    });

    const checkout = await stripe.checkout.sessions.create({
      customer: customerId,
      ui_mode: "hosted",
      mode: "payment",
      client_reference_id: args.referenceId,
      metadata: {
        ...args.metadata,
        entityId: args.entityId,
        customerId: customerId,
        referenceId: args.referenceId,
      },
      // TODO: how to handle idempotencyKeys ?
      // idempotencyKey: "",
      // --- --- ---
      line_items: args.line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_intent_data: {
        metadata: {
          entityId: args.entityId,
          customerId: customerId,
          referenceId: args.referenceId,
        },
      },
      expand: ["payment_intent"],
    });

    await storeDispatchTyped(
      {
        operation: "upsert",
        table: "stripe_checkout_sessions",
        idField: "checkoutSessionId",
        data: {
          checkoutSessionId: checkout.id,
          stripe: CheckoutSessionStripeToConvex(checkout),
          last_synced_at: Date.now(),
        },
      },
      context,
      configuration
    );

    const paymentIntent = checkout.payment_intent;

    if (
      paymentIntent &&
      paymentIntent !== null &&
      typeof paymentIntent !== "string"
    ) {
      await storeDispatchTyped(
        {
          operation: "upsert",
          table: "stripe_payment_intents",
          idField: "paymentIntentId",
          data: {
            paymentIntentId: paymentIntent.id,
            stripe: PaymentIntentStripeToConvex(paymentIntent),
            last_synced_at: Date.now(),
          },
        },
        context,
        configuration
      );
    }

    return checkout;
  },
});
