import { Redis } from "@upstash/redis";

import { STRIPE_SUB_CACHE } from "../schema/tables";
import { Context, Persistence } from "./types";

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
}
