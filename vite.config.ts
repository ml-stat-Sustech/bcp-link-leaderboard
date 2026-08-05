import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/react/") || id.includes("/node_modules/react-dom/")) {
            return "react-vendor";
          }
          if (id.includes("/node_modules/recharts/")) return "chart-vendor";
          if (id.includes("/node_modules/d3-") || id.includes("/node_modules/victory-vendor/")) {
            return "chart-deps";
          }
        },
      },
    },
  },
  server: {
    fs: {
      allow: [resolve(__dirname, "..")],
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
});
