import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "lcov"],
      include: ["core.js"],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
  },
});
