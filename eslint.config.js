import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/", "node_modules/", "scripts/**/*.js"],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts", "**/*.tsx"],

    rules: {
      // ----------------------------------------
      // Variables
      // ----------------------------------------

      // Use const when a variable is never reassigned.
      "prefer-const": "error",

      // Don't allow unused variables.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // ----------------------------------------
      // Compact formatting
      // ----------------------------------------

      // Don't allow multiple consecutive blank lines.
      "no-multiple-empty-lines": [
        "error",
        {
          max: 1,
          maxBOF: 0,
          maxEOF: 0,
        },
      ],

      // Don't allow blank lines immediately after `{`
      // or immediately before `}`.
      "padded-blocks": ["error", "never"],

      // Don't allow unnecessary blank lines around
      // control-flow statements.
      "padding-line-between-statements": [
        "error",

        // Keep consecutive variable declarations together.
        {
          blankLine: "never",
          prev: ["const", "let", "var"],
          next: ["const", "let", "var"],
        },

        // Keep statements inside blocks compact.
        {
          blankLine: "never",
          prev: "*",
          next: ["return", "throw", "break", "continue"],
        },
      ],

      // ----------------------------------------
      // General code quality
      // ----------------------------------------

      // No unreachable code.
      "no-unreachable": "error",

      // No duplicate case labels.
      "no-duplicate-case": "error",

      // No empty blocks unless they're genuinely intentional.
      "no-empty": [
        "error",
        {
          allowEmptyCatch: true,
        },
      ],

      // Don't use var.
      "no-var": "error",

      // Require === rather than ==.
      eqeqeq: ["error", "always"],

      // Disallow debugger statements.
      "no-debugger": "error",

      // Disallow console.log etc. in application code.
      // Change to "warn" if you still use console regularly.
      "no-console": "warn",
    },
  },
);
