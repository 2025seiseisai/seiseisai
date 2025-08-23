import type { NextConfig } from "next";
import getNextConfig from "../../settings/next.config.base";

const nextConfig: NextConfig = getNextConfig({
    devUrl: "http://localhost:3001/",
    prodUrl: "https://admin.seiseisai.com/",
});
export default nextConfig;
