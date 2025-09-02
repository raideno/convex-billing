import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    server: "src/server/index.ts",
  },
  sourcemap: false,
  clean: true,
  dts: true,
  format: ["esm"],
  target: "node18",
  splitting: false,
  shims: false,
  minify: false,
  tsconfig: "tsconfig.json",
});
