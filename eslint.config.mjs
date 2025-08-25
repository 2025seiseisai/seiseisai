import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import reactCompiler from "eslint-plugin-react-compiler";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    reactCompiler.configs.recommended,
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
    {
        settings: {
            next: {
                rootDir: ["./apps/admin", "./apps/tickets"],
            },
        },
    },
    {
        ignores: ["node_modules/**", "**/.next/**", "**/.turbo/**", "**/next-env.d.ts", "**/dist/**", "**/build/**"],
    },
    {
        ignores: ["./packages/ui/src/**"],
    },
];

export default eslintConfig;
