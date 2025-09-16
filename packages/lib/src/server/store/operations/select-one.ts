import { GenericMutationCtx } from "convex/server";

import { BillingDataModel } from "../../schema";

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
