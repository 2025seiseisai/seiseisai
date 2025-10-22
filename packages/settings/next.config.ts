import type { NextConfig } from "next";

const config: NextConfig = {
    experimental: {
        externalDir: true,
    },
    reactCompiler: true,
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
};
export default config;
