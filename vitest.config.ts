import { defineConfig } from "vitest/config";
import react from "@astrojs/react";
import { configDefaults } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    exclude: [...configDefaults.exclude, "e2e/**", "playwright-report/**", ".astro/**"],
    coverage: {
      skipFull: true,
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.d.ts",
        "**/*.config.ts",
        "**/*.config.js",
        "**/*.config.mjs",
        "tests/**",
        ".astro/**",
        "e2e/**",
        "playwright-report/**",
        "src/components/ui/**",
      ],
      thresholds: {
        lines: 30,
        branches: 30,
        functions: 30,
        statements: 30,
      },
    },
  },
});
