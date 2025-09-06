import { auth } from "@/impl/auth";
import dayjs from "@seiseisai/date";
import crypto from "crypto";
import { redirect } from "next/navigation";
import AuthenticationForm from "./form";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ id?: string; ts?: string; sig?: string }>;
}) {
    if ((await auth()) !== null) {
        redirect("/");
    }

    const now = dayjs();
    const { id, ts, sig } = await searchParams;
    if (!id || !ts || !sig || typeof id !== "string" || typeof ts !== "string" || typeof sig !== "string") {
        throw new Error("Invalid parameters");
    }
    const tsNum = Number(ts);
    if (Number.isNaN(tsNum) || !Number.isSafeInteger(tsNum) || tsNum <= 0) {
        throw new Error("Invalid timestamp");
    }
    const tsDate = dayjs(tsNum);
    if (now.isAfter(tsDate.add(20, "second"))) {
        return (
            <div className="mx-auto flex w-[calc(100%-40px)] flex-1 items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold sm:text-4xl">有効期限切れ</h1>
                    <p className="mt-4 text-center sm:text-lg">
                        QRコードの有効期限が切れています。
                        <br />
                        お手数をおかけしますが、もう一度QRコードを読み込んでください。
                    </p>
                </div>
            </div>
        );
    }
    const hmacKey1 = process.env.TICKET_HMAC_KEY_AUTH;
    if (!hmacKey1) {
        throw new Error("TICKET_HMAC_KEY_AUTH is not set");
    }
    const correctSig = crypto
        .createHmac("sha256", hmacKey1)
        .update(id + "_" + ts)
        .digest("hex");
    if (sig !== correctSig) {
        throw new Error("Invalid signature");
    }
    const hmacKey2 = process.env.TICKET_HMAC_KEY_LOGIN;
    if (!hmacKey2) {
        throw new Error("TICKET_HMAC_KEY_LOGIN is not set");
    }
    const loginSig = crypto
        .createHmac("sha256", hmacKey2)
        .update(id + "_" + ts)
        .digest("hex");
    return <AuthenticationForm id={id} ts={ts} sig={loginSig} />;
}
