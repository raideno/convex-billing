import { Infer, v } from "convex/values";
import Stripe from "stripe";

import {
  metadata,
  nullableboolean,
  nullablenumber,
  nullablestring,
  optionalnullableobject,
} from "@/helpers";

export const SubscriptionScheduleStripeToConvex = (
  subscriptionSchedule: Stripe.SubscriptionSchedule
) => {
  const object: Infer<typeof SubscriptionScheduleObject> = {
    id: subscriptionSchedule.id,
    current_phase: subscriptionSchedule.current_phase,
    customer:
      typeof subscriptionSchedule.customer === "string"
        ? subscriptionSchedule.customer
        : subscriptionSchedule.customer.id,
    metadata: subscriptionSchedule.metadata,
    phases: subscriptionSchedule.phases,
    status: subscriptionSchedule.status,
    object: subscriptionSchedule.object,
    application:
      typeof subscriptionSchedule.application === "string"
        ? subscriptionSchedule.application
        : subscriptionSchedule.application?.id || null,
    billing_mode: subscriptionSchedule.billing_mode,
    canceled_at: subscriptionSchedule.canceled_at,
    completed_at: subscriptionSchedule.completed_at,
    created: subscriptionSchedule.created,
    default_settings: {
      ...subscriptionSchedule.default_settings,
      automatic_tax: subscriptionSchedule.default_settings.automatic_tax
        ? {
            ...subscriptionSchedule.default_settings.automatic_tax,
            liability: subscriptionSchedule.default_settings.automatic_tax
              .liability
              ? {
                  ...subscriptionSchedule.default_settings.automatic_tax
                    .liability,
                  account:
                    typeof subscriptionSchedule.default_settings.automatic_tax
                      .liability.account === "string"
                      ? subscriptionSchedule.default_settings.automatic_tax
                          .liability.account
                      : subscriptionSchedule.default_settings.automatic_tax
                          .liability.account?.id || null,
                  type: subscriptionSchedule.default_settings.automatic_tax
                    .liability.type,
                }
              : null,
          }
        : null,
      on_behalf_of:
        typeof subscriptionSchedule.default_settings.on_behalf_of === "string"
          ? subscriptionSchedule.default_settings.on_behalf_of
          : subscriptionSchedule.default_settings.on_behalf_of?.id || null,
      invoice_settings: {
        ...subscriptionSchedule.default_settings.invoice_settings,
        issuer: {
          ...subscriptionSchedule.default_settings.invoice_settings.issuer,
          account:
            typeof subscriptionSchedule.default_settings.invoice_settings.issuer
              .account === "string"
              ? subscriptionSchedule.default_settings.invoice_settings.issuer
                  .account
              : subscriptionSchedule.default_settings.invoice_settings.issuer
                  .account?.id || null,
          type: subscriptionSchedule.default_settings.invoice_settings.issuer
            .type,
        },
        account_tax_ids:
          subscriptionSchedule.default_settings.invoice_settings.account_tax_ids?.map(
            (tax_id) => (typeof tax_id === "string" ? tax_id : tax_id.id)
          ) || null,
      },
      default_payment_method:
        typeof subscriptionSchedule.default_settings.default_payment_method ===
        "string"
          ? subscriptionSchedule.default_settings.default_payment_method
          : subscriptionSchedule.default_settings.default_payment_method?.id ||
            null,
      transfer_data: subscriptionSchedule.default_settings.transfer_data
        ? {
            ...subscriptionSchedule.default_settings.transfer_data,
            destination:
              typeof subscriptionSchedule.default_settings.transfer_data
                .destination === "string"
                ? subscriptionSchedule.default_settings.transfer_data
                    .destination
                : subscriptionSchedule.default_settings.transfer_data
                    .destination.id,
          }
        : null,
    },
    end_behavior: subscriptionSchedule.end_behavior,
    livemode: subscriptionSchedule.livemode,
    released_at: subscriptionSchedule.released_at,
    released_subscription: typeof subscriptionSchedule.released_subscription,
    test_clock:
      typeof subscriptionSchedule.test_clock === "string"
        ? subscriptionSchedule.test_clock
        : subscriptionSchedule.test_clock?.id || null,
  };
  return object;
};

export const SubscriptionScheduleSchema = {
  id: v.string(),
  current_phase: optionalnullableobject({
    end_date: v.number(),
    start_date: v.number(),
  }),
  customer: v.string(),
  metadata: v.optional(v.union(metadata(), v.null())),
  // phases: optionalnullableobject({
  //   // TODO: complete
  // }),
  phases: v.any(),
  status: v.union(
    v.literal("active"),
    v.literal("canceled"),
    v.literal("completed"),
    v.literal("not_started"),
    v.literal("released")
  ),
  object: v.string(),
  application: v.optional(nullablestring()),
  billing_mode: v.object({
    type: v.union(v.literal("classic"), v.literal("flexible")),
    updated_at: v.optional(nullablenumber()),
  }),
  canceled_at: v.optional(nullablenumber()),
  completed_at: v.optional(nullablenumber()),
  created: v.number(),
  default_settings: optionalnullableobject({
    application_fee_percent: v.optional(nullablenumber()),
    automatic_tax: optionalnullableobject({
      disabled_reason: v.optional(
        v.union(v.literal("requires_location_inputs"), v.null())
      ),
      enabled: v.optional(nullableboolean()),
      liability: optionalnullableobject({
        account: v.optional(nullablestring()),
        type: v.union(v.literal("account"), v.literal("self")),
      }),
    }),
    billing_cycle_anchor: v.union(
      v.literal("automatic"),
      v.literal("phase_start")
    ),
    billing_thresholds: optionalnullableobject({
      amount_gte: v.optional(nullablenumber()),
      reset_billing_cycle_anchor: v.optional(nullableboolean()),
    }),
    collection_method: v.optional(
      v.union(
        v.literal("charge_automatically"),
        v.literal("send_invoice"),
        v.null()
      )
    ),
    default_payment_method: v.optional(nullablestring()),
    description: v.optional(nullablestring()),
    invoice_settings: optionalnullableobject({
      account_tax_ids: v.optional(v.union(v.array(v.string()), v.null())),
      days_until_due: v.optional(nullablenumber()),
      issuer: v.object({
        account: v.optional(nullablestring()),
        type: v.union(v.literal("account"), v.literal("self")),
      }),
    }),
    on_behalf_of: v.optional(nullablestring()),
    transfer_data: optionalnullableobject({
      amount_percent: v.optional(nullablenumber()),
      destination: v.string(),
    }),
  }),
  end_behavior: v.union(
    v.literal("cancel"),
    v.literal("release"),
    v.literal("none"),
    v.literal("renew")
  ),
  livemode: v.boolean(),
  released_at: v.optional(nullablenumber()),
  released_subscription: v.optional(nullablestring()),
  test_clock: v.optional(nullablestring()),
};

export const SubscriptionScheduleObject = v.object(SubscriptionScheduleSchema);
