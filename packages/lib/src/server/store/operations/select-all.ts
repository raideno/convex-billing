import { GenericMutationCtx } from "convex/server";

import { BillingDataModel } from "@/schema";

export async function selectAll<TableName extends keyof BillingDataModel>(
  context: GenericMutationCtx<BillingDataModel>,
  table: TableName
): Promise<BillingDataModel[TableName]["document"][]> {
  return await context.db.query(table).collect();
}
