import { auth, SessionProvider } from "@/impl/auth";
import { getAllEventTicketInfos } from "@/impl/database-actions";
import { notFound } from "next/navigation";
import TicketsViewer from "./viewer";

export const dynamic = "force-dynamic";

export default async function Page() {
    if (!(await auth())?.authorityTickets) notFound();
    const ticketInfos = await getAllEventTicketInfos();
    return (
        <SessionProvider>
            <TicketsViewer initialTickets={ticketInfos ?? []} />
        </SessionProvider>
    );
}
