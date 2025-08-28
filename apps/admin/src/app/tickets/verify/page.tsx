import { auth } from "@/impl/auth";
import { notFound } from "next/navigation";
import QRReader from "./qr-reader";

export default async function Page() {
    if (!(await auth())?.authorityTicketVerification) notFound();
    return (
        <div className="mx-auto w-full max-w-[calc(100vw-2rem)] overflow-hidden sm:w-[52rem]">
            <h1 className="mt-2 mb-4 w-full text-center text-4xl font-bold">整理券の検証</h1>
            <QRReader />
        </div>
    );
}
