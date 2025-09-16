import { GenericMutationCtx } from "convex/server";
import { GenericId } from "convex/values";

import { StripeDataModel } from "../../schema";

export async function selectById<TableName extends keyof StripeDataModel>(
  context: GenericMutationCtx<StripeDataModel>,
  table: TableName,
  id: GenericId<TableName>
): Promise<StripeDataModel[TableName]["document"] | null> {
  return await context.db.get(id);
}
