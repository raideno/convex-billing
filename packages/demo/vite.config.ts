import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import path from "node:path";

import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@/convex": path.resolve(__dirname, "convex/_generated"),
    },
  },
});
