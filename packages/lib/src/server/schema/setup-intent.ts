import { metadata, nullablestring, optionalnullableobject } from "@/helpers";
import { Infer, v } from "convex/values";
import Stripe from "stripe";

export const SetupIntentStripeToConvex = (setupIntent: Stripe.SetupIntent) => {
  const object: Infer<typeof SetupIntentObject> = {
    id: setupIntent.id,
    automatic_payment_methods: setupIntent.automatic_payment_methods,
    client_secret: setupIntent.client_secret,
    customer:
      typeof setupIntent.customer === "string"
        ? setupIntent.customer
        : setupIntent.customer?.id || null,
    description: setupIntent.description || null,
    last_setup_error: setupIntent.last_setup_error,
    metadata: setupIntent.metadata,
    next_action: setupIntent.next_action,
    payment_method_options: setupIntent.payment_method_options,
    payment_method_types: setupIntent.payment_method_types,
    payment_method:
      typeof setupIntent.payment_method === "string"
        ? setupIntent.payment_method
        : setupIntent.payment_method?.id || null,
    status: setupIntent.status,
    usage: setupIntent.usage,
    object: setupIntent.object,
    application:
      typeof setupIntent.application === "string"
        ? setupIntent.application
        : setupIntent.application?.id || null,
    attach_to_self: setupIntent.attach_to_self,
    cancellation_reason: setupIntent.cancellation_reason || null,
    created: setupIntent.created,
    flow_directions: setupIntent.flow_directions,
    latest_attempt:
      typeof setupIntent.latest_attempt === "string"
        ? setupIntent.latest_attempt
        : setupIntent.latest_attempt?.id || null,
    livemode: setupIntent.livemode,
    mandate:
      typeof setupIntent.mandate === "string"
        ? setupIntent.mandate
        : setupIntent.mandate?.id || null,
    on_behalf_of:
      typeof setupIntent.on_behalf_of === "string"
        ? setupIntent.on_behalf_of
        : setupIntent.on_behalf_of?.id || null,
    payment_method_configuration_details:
      setupIntent.payment_method_configuration_details,
  };
  return object;
};

export const SetupIntentSchema = {
  id: v.string(),
  automatic_payment_methods: optionalnullableobject({
    allow_redirects: v.optional(
      v.union(v.literal("always"), v.literal("never"), v.null())
    ),
    enabled: v.optional(v.union(v.boolean(), v.null())),
  }),
  client_secret: v.optional(nullablestring()),
  customer: v.optional(nullablestring()),
  description: v.optional(nullablestring()),
  // last_setup_error: optionalnullableobject({
  //     // TODO: complete
  // }),
  last_setup_error: v.any(),
  metadata: v.optional(v.union(metadata(), v.null())),
  // next_action: optionalnullableobject({
  //     // TODO: complete
  // }),
  next_action: v.any(),
  payment_method: v.optional(nullablestring()),
  status: v.union(
    v.literal("canceled"),
    v.literal("processing"),
    v.literal("requires_action"),
    v.literal("requires_confirmation"),
    v.literal("requires_payment_method"),
    v.literal("succeeded")
  ),
  usage: v.string(),
  object: v.string(),
  application: v.optional(nullablestring()),
  attach_to_self: v.optional(v.union(v.boolean(), v.null())),
  cancellation_reason: v.optional(
    v.union(
      v.literal("abandoned"),
      v.literal("duplicate"),
      v.literal("requested_by_customer"),
      v.null()
    )
  ),
  created: v.number(),
  flow_directions: v.union(
    v.array(v.union(v.literal("inbound"), v.literal("outbound"))),
    v.null()
  ),
  latest_attempt: v.optional(nullablestring()),
  livemode: v.boolean(),
  mandate: v.optional(nullablestring()),
  on_behalf_of: v.optional(nullablestring()),
  payment_method_configuration_details: optionalnullableobject({
    id: v.string(),
    parent: v.optional(nullablestring()),
  }),
  // payment_method_options: optionalnullableobject({
  //     // TODO: complete
  // }),
  payment_method_options: v.any(),
  payment_method_types: v.array(v.string()),
  single_use_mandate: v.optional(nullablestring()),
};

export const SetupIntentObject = v.object(SetupIntentSchema);
