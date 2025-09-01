import { anyApi } from "convex/server";
import { Infer } from "convex/values";
import Stripe from "stripe";

import { STRIPE_SUB_CACHE } from "../schema/tables";
import { StoreInputValidator } from "../store";
import { Context, Persistence } from "./types";

export type StoreInput =
  | {
      type: "persistStripeCustomerId";
      entityId: string;
      stripeCustomerId: string;
    }
  | {
      type: "getStripeCustomerIdByEntityId";
      entityId: string;
    }
  | {
      type: "persistSubscriptionData";
      stripeCustomerId: string;
      data: STRIPE_SUB_CACHE;
    }
  | {
      type: "getSubscriptionDataByStripeCustomerId";
      stripeCustomerId: string;
    };

export type StoreOutput =
  | { ok: true }
  | { value: string | null }
  | { value: STRIPE_SUB_CACHE | null };

export class ConvexStore implements Persistence {
  private readonly storeRef: any;

  constructor(storeRef: any = anyApi.billing.store) {
    this.storeRef = storeRef;
  }

  async persistSubscriptionData(
    context: Context,
    params: { stripeCustomerId: string; data: STRIPE_SUB_CACHE }
  ): Promise<void> {
    await context.runMutation(this.storeRef, {
      data: {
        type: "persistSubscriptionData",
        stripeCustomerId: params.stripeCustomerId,
        data: params.data,
      },
    } as Infer<typeof StoreInputValidator>);
  }

  async getSubscriptionDataByStripeCustomerId(
    context: Context,
    stripeCustomerId: string
  ): Promise<STRIPE_SUB_CACHE | null> {
    const res = (await context.runMutation(this.storeRef, {
      data: {
        type: "getSubscriptionDataByStripeCustomerId",
        stripeCustomerId,
      },
    } as Infer<typeof StoreInputValidator>)) as {
      value: STRIPE_SUB_CACHE | null;
    };
    return res?.value ?? null;
  }

  async persistStripeCustomerId(
    context: Context,
    params: { stripeCustomerId: string; entityId: string }
  ): Promise<void> {
    await context.runMutation(this.storeRef, {
      data: {
        type: "persistStripeCustomerId",
        entityId: params.entityId,
        stripeCustomerId: params.stripeCustomerId,
      },
    } as Infer<typeof StoreInputValidator>);
  }

  async getStripeCustomerIdByEntityId(
    context: Context,
    entityId: string
  ): Promise<string | null> {
    const res = (await context.runMutation(this.storeRef, {
      data: {
        type: "getStripeCustomerIdByEntityId",
        entityId,
      },
    } as Infer<typeof StoreInputValidator>)) as { value: string | null };
    return res?.value ?? null;
  }

  async persistProducts(
    context: Context,
    products: Stripe.Product[]
  ): Promise<void> {
    await context.runMutation(this.storeRef, {
      data: {
        type: "persistProducts",
        products,
      },
    } as Infer<typeof StoreInputValidator>);
  }

  async persistPrices(context: Context, prices: Stripe.Price[]): Promise<void> {
    await context.runMutation(this.storeRef, {
      data: {
        type: "persistPrices",
        prices,
      },
    } as Infer<typeof StoreInputValidator>);
  }
}
