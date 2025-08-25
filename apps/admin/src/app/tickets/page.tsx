import { auth, SessionProvider } from "@/impl/auth";
import { getAllDrawResults, getAllEventTicketInfos } from "@seiseisai/database";
import { notFound } from "next/navigation";
import TicketsViewer from "./viewer";

export const dynamic = "force-dynamic";

export default async function Page() {
    if (!(await auth())?.authorityTickets) notFound();
    const ticketInfos = await getAllEventTicketInfos();
    const drawResults = await getAllDrawResults();
    const drawResultsMap: { [eventId: string]: number } = {};
    for (const r of drawResults) {
        drawResultsMap[r.eventId] = r.winners;
    }
    return (
        <SessionProvider>
            <TicketsViewer initialTickets={ticketInfos} initialDrawResults={drawResultsMap} />
        </SessionProvider>
    );
}
