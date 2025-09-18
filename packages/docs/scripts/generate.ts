// TODO: make sure in the docs.yaml workflow that this have been run

import fs from "fs";
import path from "path";
import url from "url";

import { stripeTables } from "@raideno/convex-stripe/server";
import { tablemark } from "tablemark";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERATIONS_DIRECTORY = path.resolve(__dirname, "../generated/");

fs.writeFileSync(
  path.join(GENERATIONS_DIRECTORY, "sync-config.md"),
  Object.entries(stripeTables)
    .map(([tableName, table]) => `\t${tableName}?: boolean;`)
    .join("\n")
);

fs.writeFileSync(
  path.join(GENERATIONS_DIRECTORY, "sync-table.md"),
  tablemark(
    Object.entries(stripeTables).map(([tableName, table]) => ({
      Table: tableName,
      Default: "`true`",
      Purpose: `Sync ${tableName.split("_").join(" ")}`,
    }))
  )
);

fs.writeFileSync(
  path.join(GENERATIONS_DIRECTORY, "tables.md"),
  Object.entries(stripeTables)
    .map(([tableName, table]) => {
      const markdown = tablemark(
        Object.entries(table.validator.fields).map(([name, validator]) => {
          return {
            Field: name,
            Type: `\`${validator.kind}\``,
            Description: name === "stripe" ? "Full Stripe object." : "",
          };
        })
      );
      const content = `
  ## \`${tableName}\`
  Stores Stripe ${tableName.split("_").join(" ")}.

  ${markdown}

  Indexes:
  - ...
  `.trim();
      return content;
    })
    .join("\n\n")
);
