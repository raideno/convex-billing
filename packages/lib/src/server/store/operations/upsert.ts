import { GenericMutationCtx, WithoutSystemFields } from "convex/server";
import { GenericId } from "convex/values";

import { BillingDataModel } from "../../schema";

export async function upsert<TableName extends keyof BillingDataModel>(
  context: GenericMutationCtx<BillingDataModel>,
  table: TableName,
  idField: keyof BillingDataModel[TableName]["document"] & string,
  data: WithoutSystemFields<BillingDataModel[TableName]["document"]>
): Promise<GenericId<TableName>> {
  const existing = await context.db
    .query(table)
    .filter((q) => q.eq(q.field(idField), (data as any)[idField]))
    .unique();

  if (existing) {
    await context.db.patch(existing._id, {
      ...data,
      last_synced_at: Date.now(),
    });
    return existing._id;
  } else {
    return await context.db.insert(table, {
      ...data,
      last_synced_at: Date.now(),
    });
  }
}
