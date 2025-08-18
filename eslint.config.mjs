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
    {
        files: ["**/*.{jsx,tsx}"],
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
            ...eslintPluginBetterTailwindcss.configs["recommended-warn"].rules,
            ...eslintPluginBetterTailwindcss.configs["recommended-error"].rules,
            "better-tailwindcss/no-unnecessary-whitespace": "off",
            "better-tailwindcss/multiline": "off",
            "better-tailwindcss/enforce-consistent-line-wrapping": "off",
        },
        settings: {
            "better-tailwindcss": {
                printWidth: 120,
                indent: 4,
                entryPoint: "./packages/ui/entryPoint.css",
            },
        },
    },
    reactCompiler.configs.recommended,
    {
        ignores: ["./packages/ui/src/*"],
    },
    {
        files: ["./packages/ui/src/**/*.{js,ts,jsx,tsx}"],
        rules: {
            "import/order": "off",
        },
    },
];

export default eslintConfig;
