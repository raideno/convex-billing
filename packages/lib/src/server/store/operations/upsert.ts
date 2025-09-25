import { GenericMutationCtx, WithoutSystemFields } from "convex/server";
import { GenericId } from "convex/values";

import { StripeDataModel } from "../../schema";

export async function upsert<TableName extends keyof StripeDataModel>(
  context: GenericMutationCtx<StripeDataModel>,
  table: TableName,
  idField: keyof StripeDataModel[TableName]["document"] & string,
  data: WithoutSystemFields<StripeDataModel[TableName]["document"]>
): Promise<GenericId<TableName>> {
  const existing = await context.db
    .query(table)
    .filter((q) => q.eq(q.field(idField), (data as any)[idField]))
    .unique();

  if (existing) {
    await context.db.patch(existing._id, {
      ...data,
      lastSyncedAt: Date.now(),
    });
    return existing._id;
  } else {
    return await context.db.insert(table, {
      ...data,
      lastSyncedAt: Date.now(),
    });
  }
}
