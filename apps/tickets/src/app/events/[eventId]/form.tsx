"use client";
import { createTicket, deleteTicket, updateTicket } from "@/impl/database-actions";
import { EventTicketType } from "@seiseisai/database/enums";
import type { EventTicketInfoModel } from "@seiseisai/database/models";
import dayjs from "@seiseisai/date";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@seiseisai/ui/components/alert-dialog";
import { Button } from "@seiseisai/ui/components/button";
import { Label } from "@seiseisai/ui/components/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@seiseisai/ui/components/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@seiseisai/ui/components/tooltip";
import { ExternalLink } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ApplicationForm({
    event,
    paperTickets = 1,
    create = false,
}: {
    event: EventTicketInfoModel;
    paperTickets?: number;
    create?: boolean;
}) {
    const router = useRouter();
    const [selectedTickets, setSelectedTickets] = useState<string>(String(paperTickets));
    const [submitting, setSubmitting] = useState(false);
    return (
        <>
            <h1 className="mt-2 mb-4 w-full text-center text-4xl font-bold">応募</h1>
            <div className="mx-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-semibold">{event.name}</h2>
                        <p className="mt-1 text-sm text-secondary-foreground">
                            開催日時: {dayjs(event.eventStart).format("HH:mm")} ~{" "}
                            {dayjs(event.eventEnd).format("HH:mm")}
                        </p>
                        <p className="text-sm text-secondary-foreground">定員: {event.capacity}人</p>
                    </div>
                    {event.link && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="secondary" size="icon" asChild>
                                    <Link href={event.link as Route} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>詳細を見る</TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <div className="flex w-full not-sm:flex-col">
                    <div className="flex-2/3">
                        <Label className="mt-4 mb-2 text-base">応募枚数について</Label>
                        <p className="mr-4 text-base">
                            このイベントでは、
                            {event.type === EventTicketType.個人制 &&
                                "1枚の紙の整理券で1人が参加可能です。同伴者も1人1枚必要です。"}
                            {event.type === EventTicketType.参加者制 &&
                                "1枚の紙の整理券で参加者1人が参加可能です。同伴者の整理券は不要です。"}
                            {event.type === EventTicketType.グループ制 &&
                                "1枚の紙の整理券で1グループ(最大5人まで)が参加可能です"}
                        </p>
                    </div>
                    <div className="flex-1/3">
                        <Label className="mt-4 mb-2 text-base">応募枚数</Label>
                        <Select
                            value={selectedTickets}
                            onValueChange={setSelectedTickets}
                            disabled={event.paperTicketsPerUser === 1}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="枚数を選択" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {Array.from({ length: event.paperTicketsPerUser }, (_, i) => i + 1).map((num) => (
                                        <SelectItem key={num} value={String(num)}>
                                            {num}枚
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="mt-6 flex w-full justify-end gap-3">
                    {!create && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="lg" variant="outline" disabled={submitting}>
                                    応募の取り消し
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>本当に応募を取り消しますか？</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        応募期間中であれば再度応募することは可能です。
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={async () => {
                                            setSubmitting(true);
                                            try {
                                                const result = await deleteTicket(event.id);
                                                if (!result) throw new Error();
                                                router.push("/");
                                            } catch {
                                                toast.error("応募の取り消しに失敗しました");
                                                setSubmitting(false);
                                            }
                                        }}
                                    >
                                        取り消す
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <Button
                        size="lg"
                        onClick={async () => {
                            setSubmitting(true);
                            if (create) {
                                try {
                                    const result = await createTicket(event.id, Number(selectedTickets));
                                    if (!result) throw new Error();
                                    router.push("/");
                                } catch {
                                    toast.error("応募に失敗しました");
                                    setSubmitting(false);
                                }
                            } else {
                                try {
                                    const result = await updateTicket(event.id, Number(selectedTickets));
                                    if (!result) throw new Error();
                                    router.push("/");
                                } catch {
                                    toast.error("応募の変更に失敗しました");
                                    setSubmitting(false);
                                }
                            }
                        }}
                        disabled={submitting}
                    >
                        {create ? "応募する" : "変更を保存"}
                    </Button>
                </div>
            </div>
        </>
    );
}
