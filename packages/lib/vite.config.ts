import { defineConfig } from "vite";

import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";
import compileTime from "vite-plugin-compile-time";

import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  build: {
    lib: {
      entry: {
        server: "src/server/index.ts",
      },
      formats: ["es"],
    },
    outDir: "dist",
    target: "node18",
    sourcemap: false,
    minify: false,
    emptyOutDir: true,
    rollupOptions: {
      external: ["convex", "stripe"],
    },
  },
  plugins: [
    tsconfigPaths(),
    dts({
      rollupTypes: true,
      insertTypesEntry: true,
      tsconfigPath: "./tsconfig.json",
      outDir: "dist",
      entryRoot: "src",
      copyDtsFiles: false,
      include: ["src/index.ts", "src/server/index.ts"],
    }),
    compileTime(),
    visualizer({
      filename: "stats.local.html",
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
  ],
});
