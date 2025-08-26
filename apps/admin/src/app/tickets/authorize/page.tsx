import { auth } from "@/impl/auth";
import { notFound } from "next/navigation";
import AuthenticationQR from "./qr";

export const dynamic = "force-dynamic";

export default async function Page() {
    const session = await auth();
    if (!session?.authorityTickets) notFound();

    const hmacKey = process.env.TICKET_HMAC_KEY;
    if (!hmacKey) throw new Error("TICKET_HMAC_KEY is not set");
    return (
        <>
            <div className="mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-1 flex-col sm:w-[52rem]">
                <h1 className="mt-2 mb-4 w-full text-center text-4xl font-bold">認証用QRコード</h1>
                <div className="flex w-full flex-1 items-center justify-around gap-8 not-sm:flex-col not-sm:gap-4">
                    <AuthenticationQR className="size-full max-h-[50svh] max-w-2/3 flex-2/5" hmacKey={hmacKey} />
                    <p className="flex-2/5 text-2xl/relaxed font-medium md:text-3xl/relaxed">
                        お手持ちのスマートフォンのカメラアプリで<span className="not-sm:hidden">左</span>
                        <span className="sm:hidden">上</span>のQRコードを読み込んでください。
                    </p>
                </div>
            </div>
        </>
    );
}
