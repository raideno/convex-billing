import { GenericActionCtx } from "convex/server";
import { GenericId, v } from "convex/values";

import { defineMutationImplementation } from "@/helpers";
import { BillingDataModel } from "@/schema";

import { InternalConfiguration } from "../types";
import { BillingDispatchArgs, BillingResultFor } from "./types";

import {
  deleteById,
  selectAll,
  selectById,
  selectOne,
  upsert,
} from "./operations";

export const StoreImplementation = defineMutationImplementation({
  name: "store",
  args: {
    operation: v.string(),
    table: v.string(),
    idField: v.optional(v.string()),
    data: v.optional(v.any()),
    idValue: v.optional(v.any()),
    field: v.optional(v.string()),
    value: v.optional(v.any()),
    id: v.optional(v.any()),
  },
  handler: async (context, args, configuration) => {
    const allowed = new Set([
      "upsert",
      "deleteById",
      "selectOne",
      "selectById",
      "selectAll",
    ]);
    if (!allowed.has(args.operation)) {
      throw new Error(`Unknown op "${args.operation}"`);
    }

    const table = args.table as keyof BillingDataModel;

    switch (args.operation) {
      case "upsert": {
        if (!args.idField) {
          throw new Error('Missing "idField" for upsert');
        }
        if (args.data == null) {
          throw new Error('Missing "data" for upsert');
        }
        const id = await upsert(
          context,
          table,
          args.idField as any,
          args.data as any
        );
        return { id };
      }

      case "deleteById": {
        if (!args.idField) {
          throw new Error('Missing "idField" for deleteById');
        }
        if (typeof args.idValue === "undefined") {
          throw new Error('Missing "idValue" for deleteById');
        }
        const deleted = await deleteById(
          context,
          table,
          args.idField as any,
          args.idValue as any
        );
        return { deleted };
      }

      case "selectOne": {
        if (!args.field) {
          throw new Error('Missing "field" for selectOne');
        }
        if (typeof args.value === "undefined") {
          throw new Error('Missing "value" for selectOne');
        }
        const doc = await selectOne(
          context,
          table,
          args.field as any,
          args.value as any
        );
        return { doc };
      }

      case "selectById": {
        if (args.id == null) {
          throw new Error('Missing "id" for selectById');
        }
        const doc = await selectById(context, table, args.id as GenericId<any>);
        return { doc };
      }

      case "selectAll": {
        const docs = await selectAll(context, table);
        return { docs };
      }
    }
  },
});

export async function billingDispatchTyped<
  A extends BillingDispatchArgs<BillingDataModel>,
>(
  args: A,
  context: GenericActionCtx<BillingDataModel>,
  configuration: InternalConfiguration
): Promise<BillingResultFor<BillingDataModel, A>> {
  return (await context.runMutation(
    `${configuration.base}:store` as any,
    args
  )) as BillingResultFor<BillingDataModel, A>;
}
