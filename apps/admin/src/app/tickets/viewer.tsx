"use client";
import { useSession } from "@/impl/auth-client";
import {
    createEventTicketInfo,
    deleteEventTicketInfo,
    getAllDrawResults,
    getAllEventTicketInfos,
    updateEventTicketInfoSafe,
    updateEventTicketInfoUnsafe,
} from "@/impl/database-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { EventTicketType, UpdateResult } from "@seiseisai/database/enums";
import type { EventTicketInfoModel } from "@seiseisai/database/models";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@seiseisai/ui/components/alert-dialog";
import { Button } from "@seiseisai/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@seiseisai/ui/components/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@seiseisai/ui/components/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@seiseisai/ui/components/form";
import { Input } from "@seiseisai/ui/components/input";
import { Label } from "@seiseisai/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@seiseisai/ui/components/radio-group";
import { Separator } from "@seiseisai/ui/components/separator";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { ListPlus, ListRestart, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Route } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ticketInfoSchema = z
    .object({
        id: z
            .string()
            .min(1, "IDは必須です。")
            .min(16, "IDは16文字以上でなければなりません。")
            .max(64, "IDは64文字以下でなければなりません。"),
        name: z.string().min(1, "イベント名は必須です。").max(256, "イベント名が長すぎます。"),
        link: z
            .string()
            .max(2048, "リンクが長すぎます。")
            .startsWith("https://", "リンクは https:// から始まる必要があります。")
            .or(z.literal("")),
        applicationStart: z.date(),
        applicationEnd: z.date(),
        exchangeEnd: z.date(),
        capacity: z.number().int().min(1, "定員は1以上です。").max(10000, "定員が大きすぎます。"),
        paperTicketsPerUser: z
            .number()
            .int()
            .min(1, "最大応募枚数は1以上です。")
            .max(10, "最大応募枚数が大きすぎます。"),
        type: z.enum(EventTicketType),
    })
    .superRefine((data, ctx) => {
        if (data.applicationStart.getSeconds() !== 0 || data.applicationStart.getMilliseconds() !== 0) {
            ctx.addIssue({
                path: ["applicationStart"],
                code: "custom",
                message: "応募開始の秒以下は0にしてください。",
            });
        }
        if (data.applicationEnd.getSeconds() !== 0 || data.applicationEnd.getMilliseconds() !== 0) {
            ctx.addIssue({
                path: ["applicationEnd"],
                code: "custom",
                message: "応募終了の秒以下は0にしてください。",
            });
        }
        if (data.exchangeEnd.getSeconds() !== 0 || data.exchangeEnd.getMilliseconds() !== 0) {
            ctx.addIssue({
                path: ["exchangeEnd"],
                code: "custom",
                message: "引き換え終了の秒以下は0にしてください。",
            });
        }
        if (data.applicationStart >= data.applicationEnd) {
            ctx.addIssue({
                path: ["applicationEnd"],
                code: "custom",
                message: "応募終了は応募開始より後でなければなりません。",
            });
        }
        if (data.applicationEnd >= data.exchangeEnd) {
            ctx.addIssue({
                path: ["exchangeEnd"],
                code: "custom",
                message: "引き換え終了は応募終了より後でなければなりません。",
            });
        }
    });

type TicketInfoForm = z.infer<typeof ticketInfoSchema>;

const ticketsAtom = atom<EventTicketInfoModel[]>([]);
const drawResultsAtom = atom<{ [eventId: string]: number }>({});

function useInitTicketsAtom() {
    const setTickets = useSetAtom(ticketsAtom);
    const setDrawResults = useSetAtom(drawResultsAtom);
    return async (showSuccessToast = true) => {
        const fetched = await getAllEventTicketInfos();
        if (fetched) {
            setTickets(fetched);
            if (showSuccessToast) {
                toast.success("更新しました。", { duration: 2000 });
            }
        } else {
            toast.error("取得に失敗しました。", { duration: 2000 });
        }
        const dr = await getAllDrawResults();
        if (dr) {
            const map: { [eventId: string]: number } = {};
            for (const r of dr) {
                map[r.eventId] = r.winners;
            }
            setDrawResults(map);
        }
    };
}

function formatDateTimeLocal(d: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseDateTimeLocal(value: string): Date | null {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date;
}

function addHours(base: Date, h: number) {
    return new Date(base.getTime() + h * 3600 * 1000);
}

function getEmptyTicket(id: string): EventTicketInfoModel {
    const now = new Date();
    now.setSeconds(0, 0);
    const start = addHours(now, 1);
    const end = addHours(start, 1);
    const exchange = addHours(end, 1);
    return {
        id,
        name: "",
        link: "",
        applicationStart: start,
        applicationEnd: end,
        exchangeEnd: exchange,
        capacity: 1,
        paperTicketsPerUser: 1,
        type: EventTicketType.個人制,
    };
}

function TicketEditor({
    placeholder,
    create = false,
    open,
    setOpen,
}: {
    placeholder: EventTicketInfoModel;
    create?: boolean;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const [overwriteWarning, setOverwriteWarning] = useState(false);
    const form = useForm<TicketInfoForm>({
        resolver: zodResolver(ticketInfoSchema),
        defaultValues: placeholder,
    });
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (open) {
            form.reset(placeholder);
        }
    }, [open, placeholder, form]);

    const initializer = useInitTicketsAtom();

    async function onSubmitSafe(data: TicketInfoForm) {
        if (create) {
            const result = await createEventTicketInfo(data);
            if (!result) {
                toast.error("作成に失敗しました。", { duration: 2000 });
                return;
            }
            toast.success("追加しました。", { duration: 2000 });
            setOpen(false);
            initializer(false);
        } else {
            console.log(placeholder, data);
            const result = await updateEventTicketInfoSafe(placeholder, data);
            if (result === null || result === UpdateResult.Invalid) {
                toast.error("保存に失敗しました。", { duration: 2000 });
                return;
            } else if (result === UpdateResult.Overwrite) {
                setOverwriteWarning(true);
                return;
            } else if (result === UpdateResult.NameExists) {
                toast.error("名前が重複しています。", { duration: 2000 });
                return;
            } else if (result === UpdateResult.NotFound) {
                toast.error("IDが見つかりません。", { duration: 2000 });
                return;
            } else if (result === UpdateResult.Success) {
                toast.success("保存しました。", { duration: 2000 });
            }
            setOpen(false);
            initializer(false);
        }
    }

    async function onSubmitUnsafe(data: TicketInfoForm) {
        const result = await updateEventTicketInfoUnsafe(data);
        if (result) {
            toast.success("保存しました。", { duration: 2000 });
            setOpen(false);
            initializer(false);
        } else {
            toast.error("保存に失敗しました。", { duration: 2000 });
        }
    }

    function datetimeField(name: keyof TicketInfoForm, label: string) {
        return (
            <FormField
                control={form.control}
                name={name}
                render={({ field }) => {
                    return (
                        <FormItem>
                            <FormLabel>{label}</FormLabel>
                            <FormControl>
                                <Input
                                    type="datetime-local"
                                    value={formatDateTimeLocal(field.value as unknown as Date)}
                                    onChange={(e) => {
                                        const d = parseDateTimeLocal(e.target.value);
                                        if (d) field.onChange(d);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    );
                }}
            />
        );
    }

    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="max-h-[92svh] w-full overflow-y-auto sm:max-w-[min(42rem,calc(100vw-2rem))]">
                    <Form {...form}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>整理券イベントの{create ? "追加" : "編集"}</AlertDialogTitle>
                            <AlertDialogDescription>
                                各設定の詳細については
                                <Link
                                    href="/tickets/help"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                >
                                    こちら
                                </Link>
                                をご覧ください。
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="grid gap-4">
                            <div className="grid items-start gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ID</FormLabel>
                                            <FormControl>
                                                <Input {...field} autoComplete="off" disabled={!create} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>イベント名</FormLabel>
                                            <FormControl>
                                                <Input {...field} autoComplete="off" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="link"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>リンク (任意)</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="https://example.com (または空)" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid items-start gap-4 sm:grid-cols-3">
                                {datetimeField("applicationStart", "応募開始")}
                                {datetimeField("applicationEnd", "応募終了")}
                                {datetimeField("exchangeEnd", "引き換え終了")}
                            </div>
                            <div className="grid items-start gap-4 sm:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="capacity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>定員</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    value={field.value}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="paperTicketsPerUser"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>1人あたりの最大応募枚数</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={field.value}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>整理券種類</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    className="gap-1 not-sm:flex not-sm:justify-around"
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    {Object.values(EventTicketType).map((t) => (
                                                        <div key={t} className="flex items-center space-x-2">
                                                            <RadioGroupItem value={t} />
                                                            <Label className="text-[12px]">{t}</Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    form.handleSubmit(onSubmitSafe)();
                                }}
                            >
                                {create ? "追加" : "保存"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </Form>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={overwriteWarning} onOpenChange={setOverwriteWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>設定は変更されています</AlertDialogTitle>
                        <AlertDialogDescription>
                            この整理券イベントは他の管理者によって編集された可能性があります。
                            <br />
                            上書きしてもよろしいですか？
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                form.handleSubmit(onSubmitUnsafe)();
                                setOverwriteWarning(false);
                            }}
                        >
                            上書き
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function DeleteDialog({
    ticket,
    open,
    setOpen,
}: {
    ticket: EventTicketInfoModel;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const initializer = useInitTicketsAtom();
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>整理券イベントの削除</AlertDialogTitle>
                    <AlertDialogDescription>
                        {ticket.name} (ID: {ticket.id}) を削除します。
                        <br />
                        この操作は取り消せません。よろしいですか？
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async () => {
                            const result = await deleteEventTicketInfo(ticket.id);
                            if (result) {
                                toast.success("削除しました。", { duration: 2000 });
                                initializer(false);
                            } else {
                                toast.error("削除に失敗しました。", { duration: 2000 });
                            }
                        }}
                    >
                        削除
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function dateToString(d: Date) {
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
}

function TicketCard({ ticket, drawResult }: { ticket: EventTicketInfoModel; drawResult?: number }) {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const session = useSession();
    return (
        <>
            <Card className="w-full sm:w-auto sm:flex-1/3">
                <div className="flex justify-between">
                    <CardHeader className="w-full gap-0 pr-0">
                        <CardTitle className="text-lg">{ticket.name}</CardTitle>
                        <CardDescription className="text-xs/relaxed">
                            ID: {ticket.id}
                            <br />
                            応募: {dateToString(ticket.applicationStart)} ~ {dateToString(ticket.applicationEnd)}
                            <br />
                            引換終了: {dateToString(ticket.exchangeEnd)}
                        </CardDescription>
                    </CardHeader>
                    {session.authorityTickets && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="mr-6 size-8 p-0">
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setEditorOpen(true);
                                    }}
                                >
                                    <Pencil />
                                    編集
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setOpenDeleteDialog(true);
                                    }}
                                >
                                    <Trash2 />
                                    削除
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                <CardContent className="flex flex-wrap gap-2 text-sm">
                    <div className="flex-1/3">
                        <Label className="text-[13px]">種類</Label>
                        {ticket.type}
                    </div>
                    <div className="flex-1/3">
                        <Label className="text-[13px]">定員</Label>
                        {ticket.capacity}人
                    </div>
                    <div className="flex-1/3">
                        <Label className="text-[13px]">最大応募可能枚数</Label>
                        {ticket.paperTicketsPerUser}枚
                    </div>
                    <div className="flex-1/3">
                        <Label className="text-[13px]">当選者数</Label>
                        {drawResult !== undefined ? `${drawResult}人` : "抽選前"}
                    </div>
                    {ticket.link && (
                        <div className="flex-1/2 truncate">
                            <Label className="text-[13px]">リンク</Label>
                            <Link href={ticket.link as Route} target="_blank" rel="noopener noreferrer">
                                {ticket.link}
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
            <TicketEditor placeholder={ticket} open={editorOpen} setOpen={setEditorOpen} />
            <DeleteDialog ticket={ticket} open={openDeleteDialog} setOpen={setOpenDeleteDialog} />
        </>
    );
}

export default function TicketsViewer({
    initialTickets,
    initialDrawResults,
}: {
    initialTickets: EventTicketInfoModel[];
    initialDrawResults: { [eventId: string]: number };
}) {
    useHydrateAtoms([[ticketsAtom, initialTickets]]);
    useHydrateAtoms([[drawResultsAtom, initialDrawResults]]);
    const tickets = useAtomValue(ticketsAtom);
    const drawResults = useAtomValue(drawResultsAtom);
    const initializer = useInitTicketsAtom();
    const [ticketId, setTicketId] = useState("");
    const [editorOpen, setEditorOpen] = useState(false);
    const session = useSession();
    return (
        <>
            <h2 className="mb-2 ml-1 w-full text-xl font-semibold md:text-2xl">整理券が必要なイベント</h2>
            <div className="mb-2 flex items-center gap-1.5">
                {session.authorityTickets && (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setTicketId(createId());
                                setEditorOpen(true);
                            }}
                        >
                            <ListPlus />
                            追加
                        </Button>
                        <Separator orientation="vertical" className="h-6!" />
                    </>
                )}
                <Button variant="ghost" size="sm" onClick={() => initializer()}>
                    <ListRestart />
                    更新
                </Button>
            </div>
            <div className="flex w-full flex-wrap gap-4">
                {tickets.map((t) => (
                    <TicketCard key={t.id} ticket={t} drawResult={drawResults[t.id]} />
                ))}
            </div>
            <TicketEditor placeholder={getEmptyTicket(ticketId)} create open={editorOpen} setOpen={setEditorOpen} />
        </>
    );
}
