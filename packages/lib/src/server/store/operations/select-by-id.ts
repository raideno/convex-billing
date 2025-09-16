import { GenericMutationCtx } from "convex/server";
import { GenericId } from "convex/values";

import { BillingDataModel } from "../../schema";

export async function selectById<TableName extends keyof BillingDataModel>(
  context: GenericMutationCtx<BillingDataModel>,
  table: TableName,
  id: GenericId<TableName>
): Promise<BillingDataModel[TableName]["document"] | null> {
  return await context.db.get(id);
}
