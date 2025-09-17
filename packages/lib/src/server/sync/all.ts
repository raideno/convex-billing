import { v } from "convex/values";

import { defineActionImplementation } from "@/helpers";

const HANDLERS_MODULES = Object.values(
  import.meta.glob("./*.handler.ts", {
    eager: true,
  })
) as unknown as Array<
  Record<string, ReturnType<typeof defineActionImplementation>>
>;

if (HANDLERS_MODULES.some((handler) => Object.keys(handler).length > 1)) {
  throw new Error(
    "Each handler file should only have one export / default export"
  );
}

// TODO: add a check to make sure the thing is of type ReturnType<typeof defineActionImplementation>
const HANDLERS = HANDLERS_MODULES.map((exports) => Object.values(exports)[0]);

export const SyncAllImplementation = defineActionImplementation({
  args: v.object({}),
  name: "sync",
  handler: async (context, args, configuration) => {
    // TODO: fix subscription.ts changing customers
    // TODO: make it parallel again Promise.all
    for (const handler of HANDLERS) {
      try {
        await handler.handler(context, {}, configuration);
      } catch (error) {
        configuration.logger.error(
          `[STRIPE SYNC ${handler.name}](Error): ${error}`
        );
      }
    }
  },
});
