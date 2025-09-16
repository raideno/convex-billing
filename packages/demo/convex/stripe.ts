import { getAuthUserId } from "@convex-dev/auth/server";
import { internalConvexStripe } from "@raideno/convex-stripe/server";
import { v } from "convex/values";

import { action, query } from "./_generated/server";
import configuration from "./stripe.config";

export const { stripe, store, sync, setup } =
  internalConvexStripe(configuration);

// TODO: create a helper function that take in an authorization function (will be passed the current context)
// And return / define a bunch of actions to get started easily
// All the ones described below
// Developers also need to specify redirect urls.

/* eslint-disable no-restricted-imports */
import {
  mutation as rawMutation,
  internalMutation as rawInternalMutation,
} from "./_generated/server";
/* eslint-enable no-restricted-imports */
import { DataModel } from "./_generated/dataModel";
import { Triggers } from "convex-helpers/server/triggers";
import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";

// TODO: how does this thing work ?
// start using Triggers, with table types from schema.ts
const triggers = new Triggers<DataModel>();

// TODO: we could maybe define the trigger directly when calling the internalConvexStripe function that exports the sync, store, etc
// register a function to run when a `ctx.db.insert`, `ctx.db.patch`, `ctx.db.replace`, or `ctx.db.delete` changes the "users" table
triggers.register("convex_stripe_payment_intents", async (context, change) => {
  const referenceId = change.newDoc?.stripe.metadata!.referenceId as string;

  const oldStatus = change.oldDoc?.stripe.status;
  const newStatus = change.newDoc?.stripe.status;

  if (newStatus === "succeeded") {
    // TODO: assign credits, send email, etc
  }
});

// create wrappers that replace the built-in `mutation` and `internalMutation`
// the wrappers override `ctx` so that `ctx.db.insert`, `ctx.db.patch`, etc. run registered trigger functions
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(
  rawInternalMutation,
  customCtx(triggers.wrapDB)
);

export const pay = action({
  args: {
    priceId: v.string(),
  },
  handler: async (context, args): Promise<{ url: string | null }> => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    // TODO: generate a unique referenceId for the payment
    // TODO: store the referenceId as well as the associated payment_intent in a payments table
    // TODO: this way we have a list of all the payment attempts

    const orderId = "#" + Math.floor(Math.random() * 1000);

    const checkout = await stripe.pay(context as any, {
      referenceId: orderId,
      entityId: userId,
      // metadata: {},
      line_items: [{ price: args.priceId, quantity: 1 }],
      success: { url: `${process.env.SITE_URL}/?return-from-checkout=success` },
      cancel: { url: `${process.env.SITE_URL}/?return-from-checkout=cancel` },
    });

    checkout.payment_intent;

    return checkout;
  },
});

export const subscribe = action({
  args: {
    priceId: v.string(),
  },
  handler: async (
    context,
    args
  ): Promise<{
    url: string | null;
  }> => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    const checkout = await stripe.subscribe(context as any, {
      entityId: userId,
      priceId: args.priceId,
      success: { url: `${process.env.SITE_URL}/?return-from-checkout=success` },
      cancel: { url: `${process.env.SITE_URL}/?return-from-checkout=cancel` },
    });

    return checkout;
  },
});

export const payments = query({
  args: v.object({}),
  handler: async (context) => {
    const intents = await context.db
      .query("convex_stripe_payment_intents")
      .collect();

    return intents;
  },
});

export const products = query({
  args: v.object({}),
  handler: async (context) => {
    const prices = await context.db.query("convex_stripe_prices").collect();
    const products = await context.db.query("convex_stripe_products").collect();

    return products.map((product) => ({
      ...product,
      prices: prices.filter(
        (price) => price.stripe.productId === product.productId
      ),
    }));
  },
});

export const subscription = query({
  args: v.object({}),
  handler: async (context) => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    const customer = await context.db
      .query("convex_stripe_customers")
      .withIndex("byEntityId", (q) => q.eq("entityId", userId))
      .unique();

    if (!customer) return null;

    const subscription = await context.db
      .query("convex_stripe_subscriptions")
      .withIndex("byCustomerId", (q) => q.eq("customerId", customer.customerId))
      .unique();

    return subscription || null;
  },
});

export const portal = action({
  args: v.object({}),
  handler: async (
    context
  ): Promise<{
    url: string | null;
  }> => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    const portal = await stripe.portal(context as any, {
      entityId: userId,
      return: { url: `${process.env.SITE_URL}/?return-from-portal=success` },
    });

    return portal;
  },
});
