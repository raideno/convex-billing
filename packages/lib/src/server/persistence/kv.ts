// persistence/kv.ts

import { Redis } from "@upstash/redis";

import { STRIPE_SUB_CACHE } from "../helpers";
import {
  Context,
  Persistence,
  getOrSetupUsage,
  getUsageParams,
  incrementUsageByAndSetupIfNotAlreadyParams,
  incrementUsageByParams,
  setupUsageParams,
} from "./types";

export class KVStore implements Persistence {
  public readonly kv: Redis;

  constructor({ url, token }: { url: string; token: string }) {
    this.kv = new Redis({
      url: url,
      token: token,
    });
  }

  async persistSubscriptionData(
    _ctx: Context,
    params: { stripeCustomerId: string; data: STRIPE_SUB_CACHE }
  ): Promise<void> {
    const { stripeCustomerId, data } = params;
    await this.kv.set(`subscription:customer:${stripeCustomerId}`, data);
  }

  async persistStripeCustomerId(
    _ctx: Context,
    params: { stripeCustomerId: string; entityId: string }
  ): Promise<void> {
    const { stripeCustomerId, entityId } = params;
    await this.kv.set(`stripe:entity:${entityId}`, stripeCustomerId);
  }

  async getStripeCustomerIdByEntityId(
    _ctx: Context,
    entityId: string
  ): Promise<string | null> {
    return (await this.kv.get(`stripe:entity:${entityId}`)) as string | null;
  }

  async getSubscriptionDataByStripeCustomerId(
    _ctx: Context,
    stripeCustomerId: string
  ): Promise<any> {
    return await this.kv.get(`subscription:customer:${stripeCustomerId}`);
  }

  async getUsage(
    _ctx: Context,
    params: getUsageParams
  ): Promise<number | null> {
    const v = await this.kv.get(
      `usage:customer:${params.stripeCustomerId}:${params.period.start}:${params.period.end}:${params.name}`
    );
    if (v === null) return null;
    return v as number;
  }

  // TODO: currently not atomic, must be fixed

  async getOrSetupUsage(
    _ctx: Context,
    { stripeCustomerId, period, name }: getOrSetupUsage
  ): Promise<number> {
    const usage = await this.getUsage(_ctx, {
      stripeCustomerId,
      period,
      name,
    });

    if (usage !== null) return usage;
    return await this.setupUsage(_ctx, {
      stripeCustomerId,
      period,
      name,
    });
  }

  async setupUsage(
    _ctx: Context,
    { stripeCustomerId, name, period }: setupUsageParams
  ): Promise<number> {
    const init = 0;

    const key = `usage:customer:${stripeCustomerId}:${period.start}:${
      period.end
    }:${name}`;
    const exists = await this.kv.get<number>(key);
    if (exists === null) {
      const ttlSeconds = period.end - Math.floor(Date.now() / 1000);
      if (ttlSeconds > 0) {
        await this.kv.set(key, init, { nx: true, ex: ttlSeconds });
      } else {
        await this.kv.set(key, init, { nx: true });
      }
      return init;
    }

    return exists as number;
  }

  // TODO: currently not atomic, must be fixed

  async incrementUsageBy(
    _ctx: Context,
    params: incrementUsageByParams
  ): Promise<boolean> {
    const isUsageSetup = await this.getUsage(_ctx, {
      stripeCustomerId: params.stripeCustomerId,
      period: params.period,
      name: params.name,
    });

    if (isUsageSetup === null) return false;

    await this.kv.incrby(
      `usage:customer:${params.stripeCustomerId}:${params.period.start}:${params.period.end}:${params.name}`,
      params.amount
    );

    return true;
  }

  async incrementUsageByAndSetupIfNotAlready(
    context: Context,
    params: incrementUsageByAndSetupIfNotAlreadyParams
  ): Promise<boolean> {
    const key = `usage:customer:${params.stripeCustomerId}:${params.period.start}:${
      params.period.end
    }:${params.name}`;
    const ttlSeconds = params.period.end - Math.floor(Date.now() / 1000);

    const res = (await this.kv.eval(
      `
         local key = KEYS[1]
         local init = tonumber(ARGV[1])
         local amount = tonumber(ARGV[2])
         local limit = tonumber(ARGV[3])
         local inclusive = tonumber(ARGV[4])
         local ttl = tonumber(ARGV[5])
     
         if redis.call("EXISTS", key) == 0 then
           if ttl > 0 then
             redis.call("SET", key, init, "EX", ttl)
           else
             redis.call("SET", key, init)
           end
         end
     
         local current = tonumber(redis.call("GET", key))
         local proposed = current + amount
     
         if limit < 0 then
           redis.call("INCRBY", key, amount)
           return 1
         end
     
         if (inclusive == 1 and proposed <= limit) or (inclusive == 0 and proposed < limit) then
           redis.call("INCRBY", key, amount)
           return 1
         else
           return 0
         end
         `,
      // KEYS
      [key],
      // ARGV
      [
        // initial usage value (use config)
        0,
        params.amount,
        // -1 = no limit
        params.limit ? params.limit.value : -1,
        params.limit && params.limit.inclusive ? 1 : 0,
        ttlSeconds,
      ]
    )) as number;

    return res === 1;
  }
}
