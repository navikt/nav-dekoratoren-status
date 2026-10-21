import tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "no-console": ["error", { allow: ["info"] }],
      "no-unused-vars": "off",
    },
  },
  globalIgnores([
    ".next/**",
    ".next-dev/**",
    "node_modules/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);
