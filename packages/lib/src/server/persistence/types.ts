// persistence/types.ts

import { GenericActionCtx, GenericMutationCtx } from "convex/server";
import { InternalConfiguration } from "../helpers";

export type Period = { start: number; end: number };

export type Context =
  // | GenericQueryCtx<any>
  GenericActionCtx<any> | GenericMutationCtx<any>;

export abstract class Persistence {
  abstract persistSubscriptionData(
    ctx: Context,
    params: { stripeCustomerId: string; data: any }
  ): Promise<void>;

  abstract getSubscriptionDataByStripeCustomerId(
    ctx: Context,
    stripeCustomerId: string
  ): Promise<any>;

  abstract persistStripeCustomerId(
    ctx: Context,
    params: { stripeCustomerId: string; entityId: string }
  ): Promise<void>;

  abstract getStripeCustomerIdByEntityId(
    ctx: Context,
    entityId: string
  ): Promise<string | null>;
}

export type PersistenceFactory = (
  configuration: InternalConfiguration
) => Persistence;
