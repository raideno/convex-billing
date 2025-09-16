import { GenericMutationCtx } from "convex/server";

import { StripeDataModel } from "@/schema";

export async function selectAll<TableName extends keyof StripeDataModel>(
  context: GenericMutationCtx<StripeDataModel>,
  table: TableName
): Promise<StripeDataModel[TableName]["document"][]> {
  return await context.db.query(table).collect();
}
