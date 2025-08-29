import type { NextConfig } from "next";
import getNextConfig from "../../settings/next.config";

const nextConfig: NextConfig = getNextConfig({
    devUrl: "http://localhost:3002/",
    prodUrl: "https://tickets.seiseisai.com/",
});
export default nextConfig;
