import Config from "../../settings/eslint.config.mjs";

const eslintConfig = [
    ...Config,
    {
        ignores: ["src/**"],
    },
];
export default eslintConfig;
