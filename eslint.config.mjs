import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import reactCompiler from "eslint-plugin-react-compiler";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    prettier,
    reactCompiler.configs.recommended,
    globalIgnores([
        "node_modules/**",
        "**/.next/**",
        "**/.turbo/**",
        "**/next-env.d.ts",
        "**/dist/**",
        "**/build/**",
        "./packages/ui/src/**",
    ]),
    {
        settings: {
            next: {
                rootDir: ["./apps/admin", "./apps/tickets"],
            },
        },
    },
    {
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            "better-tailwindcss": eslintPluginBetterTailwindcss,
        },
        rules: {
            "better-tailwindcss/enforce-consistent-line-wrapping": "off",
            "better-tailwindcss/enforce-consistent-class-order": "off",
            "better-tailwindcss/enforce-consistent-variable-syntax": "error",
            "better-tailwindcss/enforce-consistent-important-position": "error",
            "better-tailwindcss/enforce-shorthand-classes": "error",
            "better-tailwindcss/no-duplicate-classes": "error",
            "better-tailwindcss/no-deprecated-classes": "error",
            "better-tailwindcss/no-unnecessary-whitespace": "off",
            "better-tailwindcss/no-unregistered-classes": "error",
            "better-tailwindcss/no-conflicting-classes": "error",
        },
        settings: {
            "better-tailwindcss": {
                entryPoint: "./packages/ui/src/styles/globals.css",
            },
        },
    },
]);

export default eslintConfig;
