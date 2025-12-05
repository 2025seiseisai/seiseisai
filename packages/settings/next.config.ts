import type { NextConfig } from "next";
import path from "path";

const config: NextConfig = {
    experimental: {
        turbopackFileSystemCacheForDev: true,
    },
    reactCompiler: true,
    typedRoutes: true,
    images: {
        qualities: [50, 75, 100],
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
        root: path.join(__dirname, "../../"),
        rules: {
            "*.svg": {
                loaders: ["@svgr/webpack"],
                as: "*.js",
            },
        },
    },
};
export default config;
