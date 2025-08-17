export const dynamic = "force-dynamic";
import { auth } from "@/impl/auth";
import { notFound } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

export default async function Page() {
    const session = await auth();
    if (!session?.authorityTickets) notFound();

    return (
        <>
            <QRCodeSVG
                value={"https://seiseisai.com/ticket/authorize"}
                size={256}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
            />
        </>
    );
}
