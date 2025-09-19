# Organization Billing

If you bill organizations instead of users, call `setup` when creating an organization:

```ts [convex/organizations.ts]
import { v } from "convex/values";
import { query } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";

import { internal } from "./_generated/api";

export const createOrganization = query({
  args: { name: v.string() },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context);
    if (!userId) throw new Error("Not authorized.");

    const orgId = await context.db.insert("organizations", {
      name: args.name,
      ownerId: userId,
    });

    await context.scheduler.runAfter(0, internal.stripe.setup, {
      entityId: orgId,
    });

    return orgId;
  },
});
```
