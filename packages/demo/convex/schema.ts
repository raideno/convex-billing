import { authTables } from "@convex-dev/auth/server";
import { stripeTables } from "@raideno/convex-stripe/server";
import { defineSchema } from "convex/server";

export default defineSchema({
  ...stripeTables,
  ...authTables,
});
