import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ESM (important on Windows + Zed)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  {
    ignores: ["dist/", "node_modules/"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json", // explicitly point to your config
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "prefer-const": "warn",
      "no-console": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
];
