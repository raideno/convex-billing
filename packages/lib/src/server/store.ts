import { Infer, v } from "convex/values";

import { InternalConfiguration } from "./helpers";
import { MutationCtx } from "./tables";

export const StoreInputValidator = v.object({
  data: v.union(
    v.object({
      type: v.literal("persistStripeCustomerId"),
      entityId: v.string(),
      stripeCustomerId: v.string(),
    }),
    v.object({
      type: v.literal("getStripeCustomerIdByEntityId"),
      entityId: v.string(),
    }),
    v.object({
      type: v.literal("persistSubscriptionData"),
      stripeCustomerId: v.string(),
      data: v.any(),
    }),
    v.object({
      type: v.literal("getSubscriptionDataByStripeCustomerId"),
      stripeCustomerId: v.string(),
    })
  ),
});

export const storeImplementation = async (
  context: MutationCtx,
  args: Infer<typeof StoreInputValidator>,
  configuration: InternalConfiguration
) => {
  switch (args.data.type) {
    case "persistStripeCustomerId": {
      const key = `stripe:entity:${args.data.entityId}`;
      await upsertKv(context, key, args.data.stripeCustomerId);
      return { ok: true } as const;
    }
    case "getStripeCustomerIdByEntityId": {
      const key = `stripe:entity:${args.data.entityId}`;
      const value = await readKv<string | null>(context, key);
      return { value } as const;
    }
    case "persistSubscriptionData": {
      const key = `subscription:customer:${args.data.stripeCustomerId}`;
      await upsertKv(context, key, args.data);
      return { ok: true } as const;
    }
    case "getSubscriptionDataByStripeCustomerId": {
      const key = `subscription:customer:${args.data.stripeCustomerId}`;
      const value = await readKv<any | null>(context, key);
      return { value } as const;
    }
    default: {
      throw new Error("Unknown store type");
    }
  }
};

async function upsertKv(
  ctx: MutationCtx,
  key: string,
  value: unknown
): Promise<void> {
  const existing = await ctx.db
    .query("kv")
    .filter((q) => q.eq(q.field("key"), key))
    .unique();

  const serialized = JSON.stringify(value);

  if (existing) {
    await ctx.db.patch(existing._id, { value: serialized });
  } else {
    await ctx.db.insert("kv", { key, value: serialized });
  }
}

async function readKv<T>(ctx: MutationCtx, key: string): Promise<T | null> {
  const existing = await ctx.db
    .query("kv")
    .filter((q) => q.eq(q.field("key"), key))
    .unique();

  if (!existing) return null;

  try {
    return JSON.parse(existing.value) as T;
  } catch {
    return null;
  }
}
