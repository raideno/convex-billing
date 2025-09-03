import { getAuthUserId } from "@convex-dev/auth/server";

import { query } from "./_generated/server";

export const me = query({
  args: {},
  handler: async (context) => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    const user = await context.db
      .query("users")
      .filter((query) => query.eq(query.field("_id"), userId))
      .unique();

    if (!user) throw new Error("User not found");

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user._creationTime,
    };
  },
});
