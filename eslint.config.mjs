import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: true,
      },
    },
    rules: {
      // Prefer const over let when the variable is never reassigned.
      "prefer-const": "error",

      // Disallow console.log/debug; allow warn and error for intentional logging.
      "no-console": ["error", { allow: ["warn", "error"] }],

      // Enforce `import type` for type-only imports (smaller bundles, clearer intent).
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],

      // Ban explicit `any` unless suppressed with an inline eslint-disable comment.
      "@typescript-eslint/no-explicit-any": "error",

      // Delegate unused-variable detection to eslint-plugin-unused-imports (supports autofix).
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // Import order: Node built-ins → third-party → @/ absolute → relative.
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin", "type"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          distinctGroup: true,
        },
      ],
      "import/no-duplicates": "error",
      "import/first": "error",
      "import/newline-after-import": "error",

      // next-intl must only be imported inside the localization layer.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next-intl", "next-intl/*"],
              message:
                "Import next-intl only inside src/providers/i18n. Use @/hooks/useTranslations or @/providers/i18n instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/providers/i18n/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    files: ["next.config.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  eslintConfigPrettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/lib/graphql/generated/**",
  ]),
]);

export default eslintConfig;
