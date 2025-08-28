import { auth } from "@/impl/auth";
import { notFound } from "next/navigation";

export default async function Page() {
    if (!(await auth())?.authorityTicketVerification) notFound();
    return <div>Verify Ticket</div>;
}
