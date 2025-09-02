import type { Infer } from "convex/values";
import { v } from "convex/values";

import { defineMutationImplementation } from "../helpers";
import { getStripeCustomerIdByEntityId } from "./getStripeCustomerIdByEntityId";
import { getSubscriptionDataByStripeCustomerId } from "./getSubscriptionDataByStripeCustomerId";
import { persistPrices } from "./persistPrices";
import { persistProducts } from "./persistProducts";
import { persistStripeCustomerId } from "./persistStripeCustomerId";
import { persistSubscriptionData } from "./persistSubscriptionData";

// TODO: i believe we should have crud operations for each table basically instead of current mess
export const StoreInputValidator = v.object({
  args: v.union(
    v.object({
      name: v.literal("persistStripeCustomerId"),
      ...persistStripeCustomerId.args,
    }),
    v.object({
      name: v.literal("getStripeCustomerIdByEntityId"),
      ...getStripeCustomerIdByEntityId.args,
    }),
    v.object({
      name: v.literal("persistSubscriptionData"),
      ...persistSubscriptionData.args,
    }),
    v.object({
      name: v.literal("getSubscriptionDataByStripeCustomerId"),
      ...getSubscriptionDataByStripeCustomerId.args,
    }),
    v.object({
      name: v.literal("persistProducts"),
      ...persistProducts.args,
    }),
    v.object({
      name: v.literal("persistPrices"),
      ...persistPrices.args,
    })
  ),
});

export const storeImplementation = defineMutationImplementation({
  name: "store",
  args: StoreInputValidator as any,
  handler: async (context, args_, configuration) => {
    const args = args_ as Infer<typeof StoreInputValidator>;

    switch (args.args.name) {
      case "getSubscriptionDataByStripeCustomerId":
        return await getSubscriptionDataByStripeCustomerId.handler(
          context,
          args.args,
          configuration
        );
      case "getStripeCustomerIdByEntityId":
        return await getStripeCustomerIdByEntityId.handler(
          context,
          args.args,
          configuration
        );
      case "persistStripeCustomerId":
        return await persistStripeCustomerId.handler(
          context,
          args.args,
          configuration
        );
      case "persistSubscriptionData":
        return await persistSubscriptionData.handler(
          context,
          args.args,
          configuration
        );
      case "persistProducts":
        return await persistProducts.handler(context, args.args, configuration);
      case "persistPrices":
        return await persistPrices.handler(context, args.args, configuration);
      default:
        console.error("Unknown store action", args);
        break;
    }
  },
});
