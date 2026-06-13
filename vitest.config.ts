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
      ["src/lib/rate-limit.test.ts", "node"],
      ["src/lib/safe-redirect.test.ts", "node"],
      ["src/lib/auth/require-session.test.ts", "node"],
    ],
    globals: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "src/app/api/**",
        "src/lib/auth/**",
        "src/lib/ai/schemas.ts",
        "src/lib/db/insights.ts",
        "src/lib/api-client.ts",
        "src/lib/safe-redirect.ts",
        "src/lib/rate-limit.ts",
        "src/lib/enforce-rate-limit.ts",
        "src/lib/greeting.ts",
        "src/lib/markdown-lite.tsx",
      ],
      exclude: ["**/*.test.*"],
      thresholds: {
        lines: 75,
        functions: 70,
        statements: 75,
        branches: 65,
      },
    },
  },
  esbuild: {
    jsx: "automatic",
  },
});
