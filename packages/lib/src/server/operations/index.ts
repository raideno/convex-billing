import { GenericMutationCtx, WithoutSystemFields } from "convex/server";
import { GenericId } from "convex/values";

import { BillingDataModel } from "../schema";

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

export async function deleteById<
  TableName extends keyof BillingDataModel,
  Schema extends BillingDataModel[TableName]["document"],
>(
  context: GenericMutationCtx<BillingDataModel>,
  table: TableName,
  idField: keyof Schema & string,
  idValue: Schema[typeof idField]
): Promise<boolean> {
  const existing = await context.db
    .query(table)
    .filter((q) => q.eq(q.field(idField), idValue))
    .unique();

  if (existing) {
    await context.db.delete(existing._id);
    return true;
  }
  return false;
}

export async function selectOne<
  TableName extends keyof BillingDataModel,
  Schema extends BillingDataModel[TableName]["document"],
  Field extends keyof Schema & string,
>(
  context: GenericMutationCtx<BillingDataModel>,
  table: TableName,
  field: Field,
  value: Schema[Field]
): Promise<Schema | null> {
  return await context.db
    .query(table)
    .filter((q) => q.eq(q.field(field), value))
    .unique();
}

export async function selectById<TableName extends keyof BillingDataModel>(
  context: GenericMutationCtx<BillingDataModel>,
  table: TableName,
  id: GenericId<TableName>
): Promise<BillingDataModel[TableName]["document"] | null> {
  return await context.db.get(id);
}

export async function selectAll<TableName extends keyof BillingDataModel>(
  context: GenericMutationCtx<BillingDataModel>,
  table: TableName
): Promise<BillingDataModel[TableName]["document"][]> {
  return await context.db.query(table).collect();
}
