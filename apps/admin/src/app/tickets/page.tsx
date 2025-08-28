import { auth, SessionProvider } from "@/impl/auth";
import { getAllDrawResults, getAllEventTicketInfos } from "@seiseisai/database";
import { notFound, redirect } from "next/navigation";
import TicketsPageBase from "./base";
import TicketsViewer from "./viewer";

export default async function Page() {
    const session = await auth();
    if (!session) notFound();
    if (session.authorityTickets) {
        const ticketInfos = await getAllEventTicketInfos();
        const drawResults = await getAllDrawResults();
        const drawResultsMap: { [eventId: string]: number } = {};
        for (const r of drawResults) {
            drawResultsMap[r.eventId] = r.winners;
        }
        return (
            <SessionProvider>
                <TicketsPageBase>
                    <TicketsViewer initialTickets={ticketInfos} initialDrawResults={drawResultsMap} />
                </TicketsPageBase>
            </SessionProvider>
        );
    }
    if (session.authorityUserAuthentication && session.authorityTicketVerification) {
        return (
            <SessionProvider>
                <TicketsPageBase />
            </SessionProvider>
        );
    }
    if (session.authorityUserAuthentication) redirect("/tickets/authenticate");
    if (session.authorityTicketVerification) redirect("/tickets/verify");
    notFound();
}
