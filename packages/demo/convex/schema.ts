import { billingTables } from "@raideno/convex-billing/server";

import { authTables } from "@convex-dev/auth/server";
import { defineSchema } from "convex/server";

export default defineSchema({
  ...billingTables,
  ...authTables,
});
