import { anyApi } from "convex/server";

import { STRIPE_SUB_CACHE } from "../helpers";
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

  constructor({ storeRef = anyApi.billing.store }: { storeRef?: any }) {
    this.storeRef = storeRef;
  }

  async persistSubscriptionData(
    ctx: Context,
    params: { stripeCustomerId: string; data: STRIPE_SUB_CACHE }
  ): Promise<void> {
    await ctx.runMutation(this.storeRef, {
      input: {
        type: "persistSubscriptionData",
        stripeCustomerId: params.stripeCustomerId,
        data: params.data,
      },
    });
  }

  async getSubscriptionDataByStripeCustomerId(
    ctx: Context,
    stripeCustomerId: string
  ): Promise<STRIPE_SUB_CACHE | null> {
    const res = (await ctx.runMutation(this.storeRef, {
      input: {
        type: "getSubscriptionDataByStripeCustomerId",
        stripeCustomerId,
      },
    })) as { value: STRIPE_SUB_CACHE | null };
    return res?.value ?? null;
  }

  async persistStripeCustomerId(
    ctx: Context,
    params: { stripeCustomerId: string; entityId: string }
  ): Promise<void> {
    await ctx.runMutation(this.storeRef, {
      input: {
        type: "persistStripeCustomerId",
        entityId: params.entityId,
        stripeCustomerId: params.stripeCustomerId,
      },
    });
  }

  async getStripeCustomerIdByEntityId(
    ctx: Context,
    entityId: string
  ): Promise<string | null> {
    const res = (await ctx.runMutation(this.storeRef, {
      input: {
        type: "getStripeCustomerIdByEntityId",
        entityId,
      },
    })) as { value: string | null };
    return res?.value ?? null;
  }
}
