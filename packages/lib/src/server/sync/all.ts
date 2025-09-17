import { defineActionImplementation } from "@/helpers";
import { v } from "convex/values";

const HANDLERS_MODULES = import.meta.glob("./*.handler.ts", { eager: true });

export const SyncAllImplementation = defineActionImplementation({
  args: v.object({}),
  name: "sync",
  handler: async (context, args, configuration) => {
    const HANDLERS = Object.values(HANDLERS_MODULES).map(
      (handler) =>
        (handler as { default: ReturnType<typeof defineActionImplementation> })
          .default
    );

    for (const handler of HANDLERS) {
      await handler.handler(context, {}, configuration);
    }
  },
});
