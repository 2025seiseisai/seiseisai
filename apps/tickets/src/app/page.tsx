import { auth } from "@/impl/auth";
import { getAllEventTicketInfo } from "@seiseisai/database";
import dayjs from "@seiseisai/date";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@seiseisai/ui/components/card";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
    const id = await auth();
    if (!id) {
        redirect("/unauthorized");
    }
    const now = dayjs();
    const events = (await getAllEventTicketInfo()).filter((event) => dayjs(event.eventStart).isAfter(now));
    const beforeApplicationStartEvents = events.filter((event) => dayjs(event.applicationStart).isAfter(now));
    return (
        <div className="mx-auto w-full max-w-[calc(100vw-2rem)] overflow-hidden sm:w-[52rem]">
            <p className="mt-2">
                Web整理券の使用方法や注意事項などは
                <Link href="/guide" className="underline">
                    こちら
                </Link>
                をご覧ください。
            </p>
            <h2 className="mt-8 w-full text-center text-3xl font-semibold">抽選済み</h2>
            <h2 className="mt-8 w-full text-center text-3xl font-semibold">抽選待ち</h2>
            <h2 className="mt-8 w-full text-center text-3xl font-semibold">応募受付中</h2>
            {beforeApplicationStartEvents.length > 0 && (
                <>
                    <h2 className="mt-8 w-full text-center text-3xl font-semibold">応募開始前</h2>
                    <div className="mt-4 flex w-full flex-wrap gap-4">
                        {beforeApplicationStartEvents.map((event) => (
                            <Card key={event.id} className="flex-1/3 rounded-sm border p-4">
                                <CardHeader>
                                    <CardTitle className="text-2xl">{event.name}</CardTitle>
                                    <CardDescription>定員: {event.capacity}人</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">
                                        応募日時: {dayjs(event.applicationStart).format("HH:mm")} ~{" "}
                                        {dayjs(event.applicationEnd).format("HH:mm")}
                                        <br />
                                        開催日時: {dayjs(event.eventStart).format("HH:mm")} ~{" "}
                                        {dayjs(event.eventEnd).format("HH:mm")}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
