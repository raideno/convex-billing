// persistence/index.ts

import { GenericActionCtx, GenericMutationCtx } from "convex/server";
import { Configuration } from "../helpers";

export type Period = { start: number; end: number };

export type getUsageParams = { name: string; stripeCustomerId: string } & {
  period: Period;
};

export type getOrSetupUsage = {
  stripeCustomerId: string;
  name: string;
  initialUsageValue?: number;
} & {
  period: Period;
};

export type setupUsageParams = {
  stripeCustomerId: string;
  name: string;
  initialUsageValue?: number;
} & {
  period: Period;
};

export type incrementUsageByParams = {
  stripeCustomerId: string;
  name: string;
  amount: number;
} & {
  period: Period;
};

export type Limit = { value: number; inclusive: boolean };

export type incrementUsageByAndSetupIfNotAlreadyParams = {
  stripeCustomerId: string;
  name: string;
  amount: number;
  limit?: Limit;
} & {
  period: Period;
};

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

  abstract getUsage(
    ctx: Context,
    params: getUsageParams
  ): Promise<number | null>;

  abstract getOrSetupUsage(
    ctx: Context,
    params: getOrSetupUsage
  ): Promise<number>;

  abstract setupUsage(ctx: Context, params: setupUsageParams): Promise<number>;

  abstract incrementUsageBy(
    ctx: Context,
    params: incrementUsageByParams
  ): Promise<boolean>;

  abstract incrementUsageByAndSetupIfNotAlready(
    ctx: Context,
    params: incrementUsageByAndSetupIfNotAlreadyParams
  ): Promise<boolean>;
}

export type PersistenceFactory = (configuration: Configuration) => Persistence;
