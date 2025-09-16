import { v } from "convex/values";

import { storeDispatchTyped } from "@/store";

import { SubscriptionSyncImplementation } from "../sync/subscription";
import { defineRedirectHandler } from "./types";

export const PortalReturnImplementation = defineRedirectHandler({
  origins: ["portal-return"],
  data: {
    entityId: v.string(),
  },
  handle: async (origin, context, data, configuration) => {
    const customer = await storeDispatchTyped(
      {
        operation: "selectOne",
        table: "convex_stripe_customers",
        field: "entityId",
        value: data.entityId,
      },
      context,
      configuration
    );

    const customerId = customer?.doc?.customerId || null;

    if (customerId) {
      await SubscriptionSyncImplementation.handler(
        context,
        { customerId },
        configuration
      );
    } else {
      configuration.logger.warn(
        "Potential redirect abuse detected. No customerId associated with provided entityId " +
          data.entityId
      );
    }
  },
});
