import crypto from "crypto";
import { QRCodeSVG } from "qrcode.react";

export default function Verifier({ id }: { id: string }) {
    const hmacKey = process.env.TICKET_HMAC_KEY_AUTH;
    if (!hmacKey) {
        throw new Error("TICKET_HMAC_KEY_AUTH is not set");
    }
    const signature = crypto.createHmac("sha256", hmacKey).update(id).digest("hex");
    const verificationCode = `seiseisai-verify:${id}:${signature}`;
    return (
        <>
            <h1 className="mt-2 mb-4 w-full text-center text-4xl font-bold">引き換え</h1>
            <p className="mt-2 mb-8 text-center">
                必ずイベント開始時刻より前に、整理券配布場所にてスタッフに以下のQRコードを見せてください。紙の整理券と引き換えをいたします。
            </p>
            <div className="flex w-full justify-center">
                <QRCodeSVG value={verificationCode} size={256} bgColor="#ffffff" fgColor="#000000" level="M" />
            </div>
        </>
    );
}
