import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    environmentMatchGlobs: [
      ["src/middleware.test.ts", "node"],
      ["src/app/api/**/*.test.ts", "node"],
    ],
    globals: false,
  },
  esbuild: {
    jsx: "automatic",
  },
});
