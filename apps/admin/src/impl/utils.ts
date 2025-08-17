import { headers } from "next/headers";

export async function getPathname() {
    return (await headers()).get("x-url") || "/";
}
