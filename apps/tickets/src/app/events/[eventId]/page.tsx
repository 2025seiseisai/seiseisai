import { auth } from "@/impl/auth";
import { getEventTicketInfo, getTicketByEventAndUser, getTicketUserById } from "@seiseisai/database";
import { TicketStatus } from "@seiseisai/database/enums";
import dayjs from "@seiseisai/date";
import { notFound, redirect } from "next/navigation";
import ApplicationForm from "./form";
import Verifier from "./verifier";

function Wrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-1 flex-col overflow-hidden sm:w-[52rem]">
            {children}
        </div>
    );
}

export default async function Page({ params }: { params: Promise<{ eventId: string }> }) {
    const id = await auth();
    if (!id) {
        redirect("/unauthorized");
    }
    const user = await getTicketUserById(id);
    if (!user) {
        redirect("/unauthorized");
    }

    const { eventId } = await params;
    if (!eventId) {
        notFound();
    }
    const event = await getEventTicketInfo(eventId);
    if (!event) {
        notFound();
    }
    const now = dayjs();

    if (dayjs(now).isAfter(event.eventEnd)) {
        notFound();
    }

    const ticket = await getTicketByEventAndUser(eventId, id);
    if (!ticket) {
        if (dayjs(now).isAfter(event.applicationEnd)) {
            return (
                <Wrapper>
                    <div className="my-auto flex size-full flex-1 flex-col justify-center text-center">
                        <h1 className="text-3xl font-bold sm:text-4xl">応募期間終了</h1>
                        <p className="mt-4 sm:text-lg">このイベントの応募期間は終了しました。</p>
                    </div>
                </Wrapper>
            );
        }
        if (!dayjs(now).isAfter(event.applicationStart)) {
            notFound();
        }
        return (
            <Wrapper>
                <ApplicationForm event={event} applicationsSubmitted={user.applicationsSubmitted} create />
            </Wrapper>
        );
    }
    if (dayjs(now).isAfter(event.eventStart)) {
        return (
            <Wrapper>
                <div className="my-auto flex size-full flex-1 flex-col justify-center text-center">
                    <h1 className="text-3xl font-bold sm:text-4xl">有効期限切れ</h1>
                    <p className="mt-4 sm:text-lg">イベント開始後は紙の整理券に引き換えできません</p>
                </div>
            </Wrapper>
        );
    }
    if (ticket.status === TicketStatus.抽選待ち) {
        if (dayjs(now).isAfter(event.applicationEnd)) {
            redirect("/");
        }
        return (
            <Wrapper>
                <ApplicationForm
                    event={event}
                    paperTickets={ticket.paperTickets}
                    applicationsSubmitted={user.applicationsSubmitted}
                />
            </Wrapper>
        );
    }
    if (ticket.status === TicketStatus.落選) {
        redirect("/");
    }
    return (
        <Wrapper>
            <Verifier id={ticket.id} />
        </Wrapper>
    );
}
