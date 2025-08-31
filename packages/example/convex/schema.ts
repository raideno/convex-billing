import { authTables } from "@convex-dev/auth/dist/server";
import { defineSchema } from "convex/server";

export default defineSchema({
  ...authTables,
});
