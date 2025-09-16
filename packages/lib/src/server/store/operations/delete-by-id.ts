import { GenericMutationCtx } from "convex/server";

import { StripeDataModel } from "../../schema";

export async function deleteById<
  TableName extends keyof StripeDataModel,
  Schema extends StripeDataModel[TableName]["document"],
>(
  context: GenericMutationCtx<StripeDataModel>,
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
