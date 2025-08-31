import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    if (req.nextUrl.pathname === "/api/auth/signout") {
        // 期限切れ以外でのサインアウトを禁止
        const url = req.nextUrl.clone();
        url.pathname = "/404";
        return NextResponse.rewrite(url);
    }
    return NextResponse.next();
}
