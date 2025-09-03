import { anyApi, GenericActionCtx } from "convex/server";

import type { BillingDataModel } from "../schema";
import { InternalConfiguration } from "../types";
import { BillingDispatchArgs, BillingResultFor } from "./types";

export async function billingDispatchTyped<
  A extends BillingDispatchArgs<BillingDataModel>,
>(
  args: A,
  context: GenericActionCtx<BillingDataModel>,
  configuration: InternalConfiguration
): Promise<BillingResultFor<BillingDataModel, A>> {
  return (await context.runMutation(
    configuration.store,
    args
  )) as BillingResultFor<BillingDataModel, A>;
}
