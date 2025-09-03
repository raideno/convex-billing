import {
  GenericMutationCtx,
  HttpRouter,
  internalActionGeneric,
  internalMutationGeneric,
} from "convex/server";
import { GenericId, v } from "convex/values";

import { normalizeConfiguration } from "./helpers";
import {
  deleteById,
  selectAll,
  selectById,
  selectOne,
  upsert,
} from "./operations";
import { BillingDataModel } from "./schema";
import {
  buildRedirectImplementation,
  buildWebhookImplementation,
  checkoutImplementation,
  portalImplementation,
  setupImplementation,
} from "./stripe";
import { InputConfiguration } from "./types";

export * from "./schema";

export * from "./types";

export * from "./helpers";

export const internalConvexBilling = (configuration_: InputConfiguration) => {
  const configuration = normalizeConfiguration(configuration_);

  return {
    billing: {
      addHttpRoutes: (http: HttpRouter) => {
        http.route({
          path: "/stripe/webhook",
          method: "POST",
          handler: buildWebhookImplementation(configuration),
        });
        http.route({
          pathPrefix: "/stripe/return/",
          method: "GET",
          handler: buildRedirectImplementation(configuration),
        });
      },
    },
    store: internalMutationGeneric({
      args: {
        op: v.string(),
        table: v.string(),
        idField: v.optional(v.string()),
        data: v.optional(v.any()),
        idValue: v.optional(v.any()),
        field: v.optional(v.string()),
        value: v.optional(v.any()),
        id: v.optional(v.any()),
      },
      handler: async (ctx, args) => {
        const allowed = new Set([
          "upsert",
          "deleteById",
          "selectOne",
          "selectById",
          "selectAll",
        ]);
        if (!allowed.has(args.op)) {
          throw new Error(`Unknown op "${args.op}"`);
        }

        const table = args.table as keyof BillingDataModel;

        switch (args.op) {
          case "upsert": {
            if (!args.idField) {
              throw new Error('Missing "idField" for upsert');
            }
            if (args.data == null) {
              throw new Error('Missing "data" for upsert');
            }
            const id = await upsert(
              ctx as GenericMutationCtx<BillingDataModel>,
              table,
              args.idField as any,
              args.data as any
            );
            return { id };
          }

          case "deleteById": {
            if (!args.idField) {
              throw new Error('Missing "idField" for deleteById');
            }
            if (typeof args.idValue === "undefined") {
              throw new Error('Missing "idValue" for deleteById');
            }
            const deleted = await deleteById(
              ctx as GenericMutationCtx<BillingDataModel>,
              table,
              args.idField as any,
              args.idValue as any
            );
            return { deleted };
          }

          case "selectOne": {
            if (!args.field) {
              throw new Error('Missing "field" for selectOne');
            }
            if (typeof args.value === "undefined") {
              throw new Error('Missing "value" for selectOne');
            }
            const doc = await selectOne(
              ctx as GenericMutationCtx<BillingDataModel>,
              table,
              args.field as any,
              args.value as any
            );
            return { doc };
          }

          case "selectById": {
            if (args.id == null) {
              throw new Error('Missing "id" for selectById');
            }
            const doc = await selectById(
              ctx as GenericMutationCtx<BillingDataModel>,
              table,
              args.id as GenericId<any>
            );
            return { doc };
          }

          case "selectAll": {
            const docs = await selectAll(
              ctx as GenericMutationCtx<BillingDataModel>,
              table
            );
            return { docs };
          }
        }
      },
    }),
    // --- --- --- stripe.ts
    portal: internalActionGeneric({
      args: {
        entityId: v.string(),
        returnUrl: v.string(),
      },
      handler: (context, args) =>
        portalImplementation.handler(context, args, configuration),
    }),
    checkout: internalActionGeneric({
      args: {
        entityId: v.string(),
        priceId: v.string(),
        successUrl: v.string(),
        cancelUrl: v.string(),
      },
      handler: (context, args) =>
        checkoutImplementation.handler(context, args, configuration),
    }),
    setup: internalActionGeneric({
      args: {
        entityId: v.string(),
        email: v.optional(v.string()),
        metadata: v.optional(v.record(v.string(), v.any())),
      },
      handler: (context, args) =>
        setupImplementation.handler(
          context,
          {
            email: args.email,
            entityId: args.entityId,
            metadata: args.metadata,
          },
          configuration
        ),
    }),
  };
};
