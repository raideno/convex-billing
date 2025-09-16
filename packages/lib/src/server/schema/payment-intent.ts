import { Infer, v } from "convex/values";
import Stripe from "stripe";

import {
  metadata,
  nullablenumber,
  nullablestring,
  optionalnullableobject,
} from "@/helpers";

export const PaymentIntentStripeToConvex = (
  intent: Stripe.PaymentIntent
): Infer<typeof PaymentIntentObject> => {
  return {
    id: intent.id,
    amount: intent.amount,
    automatic_payment_methods: intent.automatic_payment_methods,
    client_secret: intent.client_secret ?? null,
    currency: intent.currency ?? null,
    customer:
      typeof intent.customer === "string"
        ? intent.customer
        : (intent.customer?.id ?? null),
    description: intent.description ?? null,
    last_payment_error: intent.last_payment_error,
    latest_charge:
      typeof intent.latest_charge === "string"
        ? intent.latest_charge
        : (intent.latest_charge?.id ?? null),
    metadata: intent.metadata ?? null,
    next_action: intent.next_action ?? null,
    payment_method:
      typeof intent.payment_method === "string"
        ? intent.payment_method
        : (intent.payment_method?.id ?? null),
    receipt_email: intent.receipt_email ?? null,
    setup_future_usage: intent.setup_future_usage ?? null,
    shipping: intent.shipping ?? null,
    statement_descriptor: intent.statement_descriptor ?? null,
    statement_descriptor_suffix: intent.statement_descriptor_suffix ?? null,
    status: intent.status,
    object: intent.object,
    amount_capturable: intent.amount_capturable,
    amount_details: intent.amount_details,
    amount_received: intent.amount_received,
    application:
      typeof intent.application === "string"
        ? intent.application
        : (intent.application?.id ?? null),
    application_fee_amount: intent.application_fee_amount ?? null,
    canceled_at: intent.canceled_at ?? null,
    cancellation_reason: intent.cancellation_reason ?? null,
    capture_method: intent.capture_method,
    confirmation_method: intent.confirmation_method,
    created: intent.created,
    excluded_payment_method_types: intent.excluded_payment_method_types ?? null,
    livemode: intent.livemode,
    on_behalf_of:
      typeof intent.on_behalf_of === "string"
        ? intent.on_behalf_of
        : (intent.on_behalf_of?.id ?? null),
    payment_method_configuration_details:
      intent.payment_method_configuration_details,
    payment_method_options: intent.payment_method_options ?? null,
    payment_method_types: intent.payment_method_types,
    presentment_details: intent.presentment_details ?? null,
    processing: intent.processing ?? null,
    review:
      typeof intent.review === "string"
        ? intent.review
        : (intent.review?.id ?? null),
    transfer_data: intent.transfer_data ?? null,
    transfer_group: intent.transfer_group ?? null,
  };
};

export const PaymentIntentSchema = {
  id: v.string(),
  amount: v.number(),
  automatic_payment_methods: v.optional(
    v.union(
      v.object({
        allow_redirects: v.optional(
          v.union(v.literal("always"), v.literal("never"), v.null())
        ),
        enabled: v.boolean(),
      }),
      v.null()
    )
  ),
  client_secret: v.optional(nullablestring()),
  currency: v.union(v.string(), v.null()),
  customer: v.optional(nullablestring()),
  description: v.optional(nullablestring()),
  last_payment_error: v.optional(
    v.union(
      v.object({
        advice_code: v.optional(nullablestring()),
        charge: v.optional(nullablestring()),
        code: v.optional(nullablestring()),
        decline_code: v.optional(nullablestring()),
        doc_url: v.optional(nullablestring()),
        message: v.optional(nullablestring()),
        network_advice_code: v.optional(nullablestring()),
        network_decline_code: v.optional(nullablestring()),
        param: v.optional(nullablestring()),
        // payment_method: optionalnullableobject({
        //   // TODO: complete
        // }),
        payment_method: v.optional(v.any()),
        payment_method_type: v.optional(nullablestring()),
        // last_payment_error: optionalnullableobject({
        //   // TODO: complete
        // }),
        last_payment_error: v.optional(v.any()),
        type: v.union(
          v.literal("api_error"),
          v.literal("card_error"),
          v.literal("idempotency_error"),
          v.literal("invalid_request_error")
        ),
        latest_charge: v.optional(nullablestring()),
      }),
      v.null()
    )
  ),
  latest_charge: v.optional(nullablestring()),
  metadata: v.optional(v.union(metadata(), v.null())),
  // next_action: optionalnullableobject({
  //   // TODO: complete
  // }),
  next_action: v.optional(v.any()),
  payment_method: v.optional(nullablestring()),
  receipt_email: v.optional(nullablestring()),
  setup_future_usage: v.union(
    v.literal("off_session"),
    v.literal("on_session"),
    v.null()
  ),
  // shipping: optionalnullableobject({
  //   // TODO: complete
  // }),
  shipping: v.optional(v.any()),
  statement_descriptor: v.optional(nullablestring()),
  statement_descriptor_suffix: v.optional(nullablestring()),
  status: v.union(
    v.literal("canceled"),
    v.literal("processing"),
    v.literal("requires_action"),
    v.literal("requires_capture"),
    v.literal("requires_confirmation"),
    v.literal("requires_payment_method"),
    v.literal("succeeded")
  ),
  object: v.string(),
  amount_capturable: v.number(),
  amount_details: optionalnullableobject({
    tip: optionalnullableobject({
      amount: v.optional(nullablenumber()),
    }),
  }),
  amount_received: v.number(),
  application: v.optional(nullablestring()),
  application_fee_amount: v.optional(nullablenumber()),
  canceled_at: v.optional(nullablenumber()),
  cancellation_reason: v.optional(
    v.union(
      v.literal("abandoned"),
      v.literal("automatic"),
      v.literal("duplicate"),
      v.literal("expired"),
      v.literal("failed_invoice"),
      v.literal("fraudulent"),
      v.literal("requested_by_customer"),
      v.literal("void_invoice"),
      v.null()
    )
  ),
  capture_method: v.union(
    v.literal("automatic"),
    // TODO: i think automatic_sync isn't a valid option here
    v.literal("automatic_sync"),
    v.literal("automatic_async"),
    v.literal("manual")
  ),
  confirmation_method: v.union(v.literal("automatic"), v.literal("manual")),
  created: v.number(),
  // TODO: fix enum
  excluded_payment_method_types: v.union(v.array(v.string()), v.null()),
  // exclude_payment_method_types: v.optional(
  //   // TODO: should be array of enums
  //   v.union(v.array(v.string()), v.null())
  // ),
  livemode: v.boolean(),
  on_behalf_of: v.optional(nullablestring()),
  payment_method_configuration_details: optionalnullableobject({
    id: v.string(),
    parent: v.optional(nullablestring()),
  }),
  // payment_method_options: optionalnullableobject({
  //   // TODO: complete
  // }),
  payment_method_options: v.optional(v.any()),
  payment_method_types: v.array(v.string()),
  // presentment_details: optionalnullableobject({
  //   // TODO: complete
  // }),
  presentment_details: v.optional(v.any()),
  // processing: optionalnullableobject({
  //   // TODO: complete
  // }),
  processing: v.optional(v.any()),
  review: v.optional(nullablestring()),
  // transfer_data: optionalnullableobject({
  //   // TODO: complete
  // }),
  transfer_data: v.optional(v.any()),
  transfer_group: v.optional(nullablestring()),
};

export const PaymentIntentObject = v.object(PaymentIntentSchema);
