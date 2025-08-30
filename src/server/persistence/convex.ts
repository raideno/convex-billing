// persistence/convex.ts

import { v } from "convex/values";
import {
  internalQueryGeneric,
  internalMutationGeneric,
  anyApi,
} from "convex/server";
import { Configuration } from "../helpers";
import {
  Persistence,
  getUsageParams,
  getOrSetupUsage,
  setupUsageParams,
  incrementUsageByParams,
  incrementUsageByAndSetupIfNotAlreadyParams,
  Context,
} from "./index";

export const kvGet = internalQueryGeneric({
  args: { key: v.string() },
  handler: async (ctx, args): Promise<any | null> => {
    const row = await ctx.db
      .query("kv")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!row) return null;
    const now = Math.floor(Date.now() / 1000);
    if (row.expiresAt !== undefined && row.expiresAt <= now) {
      // Expired. Treat as missing.
      return null;
    }
    return row.value ?? null;
  },
});

export const kvSet = internalMutationGeneric({
  args: {
    key: v.string(),
    value: v.any(),
    nx: v.optional(v.boolean()),
    ttlSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt =
      args.ttlSeconds && args.ttlSeconds > 0
        ? now + Math.floor(args.ttlSeconds)
        : undefined;

    const existing = await ctx.db
      .query("kv")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      if (args.nx) return false;
      await ctx.db.patch(existing._id, {
        value: args.value,
        expiresAt,
      });
      return true;
    }

    await ctx.db.insert("kv", {
      key: args.key,
      value: args.value,
      expiresAt,
    });
    return true;
  },
});

export const kvEnsure = internalMutationGeneric({
  args: {
    key: v.string(),
    init: v.any(),
    ttlSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any> => {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt =
      args.ttlSeconds && args.ttlSeconds > 0
        ? now + Math.floor(args.ttlSeconds)
        : undefined;

    const existing = await ctx.db
      .query("kv")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!existing) {
      await ctx.db.insert("kv", {
        key: args.key,
        value: args.init,
        expiresAt,
      });
      return args.init;
    }

    const expired =
      existing.expiresAt !== undefined && existing.expiresAt <= now;
    if (expired) {
      await ctx.db.patch(existing._id, {
        value: args.init,
        expiresAt,
      });
      return args.init;
    }

    return existing.value;
  },
});

export const kvIncrBy = internalMutationGeneric({
  args: {
    key: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const row = await ctx.db
      .query("kv")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!row) return false;
    const now = Math.floor(Date.now() / 1000);
    const expired = row.expiresAt !== undefined && row.expiresAt <= now;
    if (expired) return false;

    const current = Number(row.value ?? 0);
    if (!Number.isFinite(current)) return false;

    await ctx.db.patch(row._id, { value: current + args.amount });
    return true;
  },
});

export const kvIncrByBounded = internalMutationGeneric({
  args: {
    key: v.string(),
    amount: v.number(),
    limit: v.number(), // -1 = no limit
    inclusive: v.boolean(),
    init: v.number(),
    ttlSeconds: v.number(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt =
      args.ttlSeconds && args.ttlSeconds > 0
        ? now + Math.floor(args.ttlSeconds)
        : undefined;

    let row = await ctx.db
      .query("kv")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!row) {
      // initialize
      const _id = await ctx.db.insert("kv", {
        key: args.key,
        value: args.init,
        expiresAt,
      });
      row = await ctx.db.get(_id);
    }

    const expired = row && row.expiresAt !== undefined && row.expiresAt <= now;
    if (expired) {
      // Reset if expired
      await ctx.db.patch(row!._id, {
        value: args.init,
        expiresAt,
      });
      row = await ctx.db.get(row!._id);
    }

    const current = Number(row!.value ?? 0);
    if (!Number.isFinite(current)) return false;

    const proposed = current + args.amount;

    if (args.limit < 0) {
      await ctx.db.patch(row!._id, { value: proposed });
      return true;
    }

    const ok =
      (args.inclusive && proposed <= args.limit) ||
      (!args.inclusive && proposed < args.limit);

    if (!ok) return false;

    await ctx.db.patch(row!._id, { value: proposed });
    return true;
  },
});

export class ConvexStore implements Persistence {
  private readonly configuration: Configuration;

  constructor(configuration: Configuration) {
    this.configuration = configuration;
  }

  private keyForSubscriptionCustomer(stripeCustomerId: string) {
    return `subscription:customer:${stripeCustomerId}`;
  }

  private keyForStripeEntity(entityId: string) {
    return `stripe:entity:${entityId}`;
  }

  private keyForUsage(
    stripeCustomerId: string,
    period: { start: number; end: number },
    name: string
  ) {
    return `usage:customer:${stripeCustomerId}:${period.start}:${period.end}:${name}`;
  }

  async persistSubscriptionData(
    ctx: Context,
    params: { stripeCustomerId: string; data: any }
  ): Promise<void> {
    await ctx.runMutation(anyApi.billing.kvSet, {
      key: this.keyForSubscriptionCustomer(params.stripeCustomerId),
      value: params.data,
    });
  }

  async getSubscriptionDataByStripeCustomerId(
    ctx: Context,
    stripeCustomerId: string
  ): Promise<any> {
    return await ctx.runQuery(anyApi.billing.kvGet, {
      key: this.keyForSubscriptionCustomer(stripeCustomerId),
    });
  }

  async persistStripeCustomerId(
    ctx: Context,
    params: { stripeCustomerId: string; entityId: string }
  ): Promise<void> {
    await ctx.runMutation(anyApi.billing.kvSet, {
      key: this.keyForStripeEntity(params.entityId),
      value: params.stripeCustomerId,
    });
  }

  async getStripeCustomerIdByEntityId(
    ctx: Context,
    entityId: string
  ): Promise<string | null> {
    return (await ctx.runQuery(anyApi.billing.kvGet, {
      key: this.keyForStripeEntity(entityId),
    })) as string | null;
  }

  async getUsage(ctx: Context, params: getUsageParams): Promise<number | null> {
    const value = await ctx.runQuery(anyApi.billing.kvGet, {
      key: this.keyForUsage(
        params.stripeCustomerId,
        params.period,
        params.name
      ),
    });
    if (value === null || value === undefined) return null;
    return Number(value);
  }

  async getOrSetupUsage(
    ctx: Context,
    params: getOrSetupUsage
  ): Promise<number> {
    const ttlSeconds = params.period.end - Math.floor(Date.now() / 1000);
    const value = await ctx.runMutation(anyApi.billing.kvEnsure, {
      key: this.keyForUsage(
        params.stripeCustomerId,
        params.period,
        params.name
      ),
      init:
        params.initialUsageValue ??
        this.configuration.credits_initial_usage_value,
      ttlSeconds,
    });
    return Number(value);
  }

  async setupUsage(ctx: Context, params: setupUsageParams): Promise<number> {
    const ttlSeconds = params.period.end - Math.floor(Date.now() / 1000);
    const value = await ctx.runMutation(anyApi.billing.kvEnsure, {
      key: this.keyForUsage(
        params.stripeCustomerId,
        params.period,
        params.name
      ),
      init:
        params.initialUsageValue ??
        this.configuration.credits_initial_usage_value,
      ttlSeconds,
    });
    return Number(value);
  }

  async incrementUsageBy(
    ctx: Context,
    params: incrementUsageByParams
  ): Promise<boolean> {
    return await ctx.runMutation(anyApi.billing.kvIncrBy, {
      key: this.keyForUsage(
        params.stripeCustomerId,
        params.period,
        params.name
      ),
      amount: params.amount,
    });
  }

  async incrementUsageByAndSetupIfNotAlready(
    ctx: Context,
    params: incrementUsageByAndSetupIfNotAlreadyParams
  ): Promise<boolean> {
    const ttlSeconds = params.period.end - Math.floor(Date.now() / 1000);
    return await ctx.runMutation(anyApi.billing.kvIncrByBounded, {
      key: this.keyForUsage(
        params.stripeCustomerId,
        params.period,
        params.name
      ),
      amount: params.amount,
      limit: params.limit ? params.limit.value : -1,
      inclusive: params.limit ? !!params.limit.inclusive : false,
      init: this.configuration.credits_initial_usage_value,
      ttlSeconds,
    });
  }
}
