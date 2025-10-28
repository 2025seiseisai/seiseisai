import { auth } from "@/impl/auth";
import { getAllEventTicketInfo, getAllTickets, getTicketUserById } from "@seiseisai/database";
import { TicketStatus } from "@seiseisai/database/enums";
import { EventTicketInfoModel, TicketModel } from "@seiseisai/database/models";
import dayjs from "@seiseisai/date";
import { Button } from "@seiseisai/ui/components/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@seiseisai/ui/components/card";
import { Label } from "@seiseisai/ui/components/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@seiseisai/ui/components/tooltip";
import { ExternalLink } from "lucide-react";
import { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

enum EventStatus {
    応募開始前,
    応募受付中,
    応募受付中_期間重複,
    応募受付中_回数制限,
    抽選待ち_編集可,
    抽選待ち,
    当選,
    落選,
}

function EventCard({ event, status }: { event: EventTicketInfoModel; status: EventStatus }) {
    const statusDescription = {
        [EventStatus.応募開始前]: "応募開始前",
        [EventStatus.応募受付中]: "応募受付中",
        [EventStatus.応募受付中_期間重複]: "応募受付中",
        [EventStatus.応募受付中_回数制限]: "応募受付中",
        [EventStatus.抽選待ち_編集可]: "抽選待ち",
        [EventStatus.抽選待ち]: "抽選待ち",
        [EventStatus.当選]: "抽選済み",
        [EventStatus.落選]: "抽選済み",
    };
    return (
        <Card className="w-full sm:w-auto sm:flex-1/3">
            <CardHeader className="w-full gap-0.5 pr-0">
                <CardTitle className="text-xl">{event.name}</CardTitle>
                <CardDescription>
                    定員{event.capacity}枠・{statusDescription[status]}
                </CardDescription>
                {event.link && (
                    <CardAction>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="secondary" size="icon" className="mr-4" asChild>
                                    <Link href={event.link as Route} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>詳細を見る</TooltipContent>
                        </Tooltip>
                    </CardAction>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    <div className="flex-1/3 text-sm">
                        <Label className="text-[13px]">応募日時</Label>
                        {dayjs(event.applicationStart).format("HH:mm")} ~ {""}
                        {dayjs(event.applicationEnd).format("HH:mm")}
                    </div>
                    <div className="flex-1/3 text-sm">
                        <Label className="text-[13px]">開催日時</Label>
                        {dayjs(event.eventStart).format("HH:mm")} ~ {""}
                        {dayjs(event.eventEnd).format("HH:mm")}
                    </div>
                </div>
                {status === EventStatus.当選 && (
                    <div className="mt-4 w-full rounded-md bg-secondary py-2 text-center text-2xl font-semibold">
                        当選！🥳
                    </div>
                )}
                {status === EventStatus.落選 && (
                    <div className="mt-4 w-full rounded-md bg-secondary py-2 text-center text-2xl font-semibold">
                        残念...😢
                    </div>
                )}
            </CardContent>
            {status === EventStatus.応募受付中 && (
                <CardFooter>
                    <Button className="w-full" asChild>
                        <Link href={`/events/${event.id}`}>応募する</Link>
                    </Button>
                </CardFooter>
            )}
            {status === EventStatus.応募受付中_期間重複 && (
                <CardFooter>
                    <Button variant="outline" className="w-full" disabled>
                        他の応募と開催期間が重複しています
                    </Button>
                </CardFooter>
            )}
            {status === EventStatus.応募受付中_回数制限 && (
                <CardFooter>
                    <Button variant="outline" className="w-full" disabled>
                        応募は1人10枚までです
                    </Button>
                </CardFooter>
            )}
            {status === EventStatus.抽選待ち_編集可 && (
                <CardFooter>
                    <Button className="w-full" asChild>
                        <Link href={`/events/${event.id}`}>応募内容の編集/取り消し</Link>
                    </Button>
                </CardFooter>
            )}
            {status === EventStatus.抽選待ち && (
                <CardFooter>
                    <Button variant="outline" className="w-full" disabled>
                        現在抽選待ちです
                    </Button>
                </CardFooter>
            )}
            {status === EventStatus.当選 && (
                <CardFooter>
                    <Button className="w-full" asChild>
                        <Link href={`/events/${event.id}`}>紙の整理券と引き換え</Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

export default async function Page() {
    const id = await auth();
    if (!id) {
        redirect("/unauthorized");
    }
    const now = dayjs();
    const user = await getTicketUserById(id);
    if (!user) {
        redirect("/unauthorized");
    }
    const limited = user.applicationsSubmitted >= 10;
    const events = (await getAllEventTicketInfo()).filter((event) => {
        return (
            dayjs(event.eventStart).isAfter(now) &&
            (dayjs(event.applicationStart).isSame(now, "day") || dayjs(event.eventStart).isSame(now, "day"))
        );
    });
    const eventsDict: { [eventId: string]: EventTicketInfoModel } = {};
    events.forEach((event) => {
        eventsDict[event.id] = event;
    });
    const tickets = await getAllTickets(id);
    const ticketsDict: { [eventId: string]: TicketModel } = {};
    tickets.forEach((ticket) => {
        ticketsDict[ticket.eventId] = ticket;
    });
    const wonEvents = events.filter((event) => ticketsDict[event.id]?.status === TicketStatus.当選);
    const lostEvents = events.filter((event) => ticketsDict[event.id]?.status === TicketStatus.落選);
    const waitingEvents = events.filter((event) => ticketsDict[event.id]?.status === TicketStatus.抽選待ち);
    const eventsAcceptingApplications = events.filter(
        (event) =>
            !(event.id in ticketsDict) &&
            dayjs(now).isAfter(event.applicationStart) &&
            dayjs(event.applicationEnd).isAfter(now),
    );
    const eventsBeforeApplicationStarts = events.filter((event) => dayjs(event.applicationStart).isAfter(now));
    wonEvents.sort((a, b) => dayjs(a.eventStart).diff(dayjs(b.eventStart)));
    lostEvents.sort((a, b) => dayjs(a.eventStart).diff(dayjs(b.eventStart)));
    waitingEvents.sort((a, b) => dayjs(a.eventStart).diff(dayjs(b.eventStart)));
    eventsAcceptingApplications.sort((a, b) => dayjs(a.eventStart).diff(dayjs(b.eventStart)));
    eventsBeforeApplicationStarts.sort((a, b) => dayjs(a.eventStart).diff(dayjs(b.eventStart)));
    return (
        <div className="mx-auto w-full max-w-[calc(100vw-2rem)] overflow-hidden sm:w-208">
            <p className="mt-4">
                Web整理券の使用方法や注意事項などは
                <Link href="/guide" className="underline">
                    こちら
                </Link>
                をご覧ください。
            </p>
            {wonEvents.length + lostEvents.length > 0 && (
                <>
                    <h2 className="mt-8 w-full text-center text-3xl font-semibold">抽選済み</h2>
                    <div className="mt-4 flex w-full flex-wrap gap-4">
                        {wonEvents.map((event) => (
                            <EventCard key={event.id} event={event} status={EventStatus.当選} />
                        ))}
                        {lostEvents.map((event) => (
                            <EventCard key={event.id} event={event} status={EventStatus.落選} />
                        ))}
                    </div>
                </>
            )}
            {waitingEvents.length > 0 && (
                <>
                    <h2 className="mt-8 w-full text-center text-3xl font-semibold">抽選待ち</h2>
                    <div className="mt-4 flex w-full flex-wrap gap-4">
                        {waitingEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                status={
                                    dayjs(event.applicationEnd).isAfter(now)
                                        ? EventStatus.抽選待ち_編集可
                                        : EventStatus.抽選待ち
                                }
                            />
                        ))}
                    </div>
                </>
            )}
            {eventsAcceptingApplications.length > 0 && (
                <>
                    <h2 className="mt-8 w-full text-center text-3xl font-semibold">応募受付中</h2>
                    <div className="mt-4 flex w-full flex-wrap gap-4">
                        {eventsAcceptingApplications.map((event) => {
                            let status = EventStatus.応募受付中;
                            if (limited) {
                                status = EventStatus.応募受付中_回数制限;
                            } else {
                                let overlapping = false;
                                for (const ticket of tickets) {
                                    const eventOfTicket = eventsDict[ticket.eventId];
                                    if (
                                        eventOfTicket &&
                                        dayjs(event.eventEnd).isAfter(dayjs(eventOfTicket.eventStart)) &&
                                        dayjs(eventOfTicket.eventEnd).isAfter(dayjs(event.eventStart))
                                    ) {
                                        overlapping = true;
                                        break;
                                    }
                                }
                                if (overlapping) {
                                    status = EventStatus.応募受付中_期間重複;
                                }
                            }
                            return <EventCard key={event.id} event={event} status={status} />;
                        })}
                    </div>
                </>
            )}
            {eventsBeforeApplicationStarts.length > 0 && (
                <>
                    <h2 className="mt-8 w-full text-center text-3xl font-semibold">応募開始前</h2>
                    <div className="mt-4 flex w-full flex-wrap gap-4">
                        {eventsBeforeApplicationStarts.map((event) => (
                            <EventCard key={event.id} event={event} status={EventStatus.応募開始前} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
