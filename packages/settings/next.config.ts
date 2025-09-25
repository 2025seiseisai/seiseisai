import type { NextConfig } from "next";

const config: NextConfig = {
    experimental: {
        reactCompiler: true,
        externalDir: true,
    },
    typedRoutes: true,
    images: {
        qualities: [75, 50, 100],
    },
    transpilePackages: [
        "@seiseisai/blog",
        "@seiseisai/database",
        "@seiseisai/ui",
        "@seiseisai/turnstile",
        "@seiseisai/date",
        "@seiseisai/news",
    ],
    turbopack: {
        rules: {
            "*.svg": {
                loaders: ["@svgr/webpack"],
                as: "*.js",
            },
        },
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};
export default config;
