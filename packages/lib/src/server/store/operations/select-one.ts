import { GenericMutationCtx } from "convex/server";

import { StripeDataModel } from "../../schema";

export async function selectOne<
  TableName extends keyof StripeDataModel,
  Schema extends StripeDataModel[TableName]["document"],
  Field extends keyof Schema & string,
>(
  context: GenericMutationCtx<StripeDataModel>,
  table: TableName,
  field: Field,
  value: Schema[Field]
): Promise<Schema | null> {
  return await context.db
    .query(table)
    .filter((q) => q.eq(q.field(field), value))
    .unique();
}
