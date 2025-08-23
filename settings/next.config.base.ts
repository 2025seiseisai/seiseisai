export default function getNextConfig(options: { devUrl: string; prodUrl: string }) {
    return {
        experimental: {
            reactCompiler: true,
            externalDir: true,
        },
        typedRoutes: true,
        env: {
            AUTH_URL: process.env.NODE_ENV === "development" ? options.devUrl : options.prodUrl,
        },
        images: {
            qualities: [75, 50, 100],
        },
        transpilePackages: ["@seiseisai/database", "@seiseisai/ui"],
        turbopack: {
            rules: {
                "*.svg": {
                    loaders: ["@svgr/webpack"],
                    as: "*.js",
                },
            },
        },
    };
}
