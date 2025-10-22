import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-url", request.nextUrl.pathname);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}
