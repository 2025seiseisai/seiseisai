"use client";
import { createNews, deleteNews, getAllNews, updateNewsSafe, updateNewsUnsafe } from "@/impl/database-actions";
import { createId } from "@paralleldrive/cuid2";
import { UpdateResult } from "@seiseisai/database/enums";
import type { NewsModel } from "@seiseisai/database/models";
import dayjs from "@seiseisai/date";
import NewsPreview from "@seiseisai/news";
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
import { Calendar } from "@seiseisai/ui/components/calendar";
import { Card, CardContent } from "@seiseisai/ui/components/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@seiseisai/ui/components/dropdown-menu";
import { Input } from "@seiseisai/ui/components/input";
import { Label } from "@seiseisai/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@seiseisai/ui/components/popover";
import { RadioGroup, RadioGroupItem } from "@seiseisai/ui/components/radio-group";
import { Separator } from "@seiseisai/ui/components/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@seiseisai/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@seiseisai/ui/components/tabs";
import { Textarea } from "@seiseisai/ui/components/textarea";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { ChevronDownIcon, ListPlus, ListRestart, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import "./news.scss";

const newsSchema = z.object({
    id: z
        .string()
        .min(1, "IDは必須です。")
        .min(16, "IDは16文字以上でなければなりません。")
        .max(64, "IDは64文字以下でなければなりません。"),
    title: z.string().min(1, "タイトルは必須です。").max(256, "タイトルが長すぎます。"),
    content: z.string().min(1, "内容は必須です。").max(65536, "内容が長すぎます。"),
    importance: z.boolean(),
    date: z.date().refine(
        (date) => {
            return (
                date.getHours() === 0 &&
                date.getMinutes() === 0 &&
                date.getSeconds() === 0 &&
                date.getMilliseconds() === 0
            );
        },
        {
            message: "時刻は指定できません。日付のみを指定してください。",
        },
    ),
});

const newsAtom = atom<NewsModel[]>([]);

function useInitNewsAtom() {
    const setNews = useSetAtom(newsAtom);
    return async (showSuccessToast = true) => {
        const fetchedNews = await getAllNews();
        if (fetchedNews) {
            setNews(fetchedNews);
            if (showSuccessToast) {
                toast.success("更新しました。", {
                    duration: 2000,
                });
            }
        } else {
            toast.error("取得に失敗しました。", {
                duration: 2000,
            });
        }
    };
}

function formatDate(date: Date | string): string {
    return dayjs(date).format("YYYY/MM/DD");
}

function currentDate(): Date {
    return dayjs().startOf("day").toDate();
}

function NewsEditor({
    open,
    setOpen,
    placeholder,
    create = false,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    placeholder: NewsModel;
    create?: boolean;
}) {
    const [idValue, setIdValue] = useState(placeholder.id);
    const [titleValue, setTitleValue] = useState(placeholder.title);
    const [dateValue, setDateValue] = useState(placeholder.date);
    const [contentValue, setContentValue] = useState(placeholder.content);
    const [importanceValue, setImportanceValue] = useState(placeholder.importance);
    useEffect(() => {
        setIdValue(placeholder.id);
        setTitleValue(placeholder.title);
        setDateValue(placeholder.date);
        setContentValue(placeholder.content);
        setImportanceValue(placeholder.importance);
    }, [placeholder, create]);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [overwriteWarning, setOverwriteWarning] = useState(false);
    const initializer = useInitNewsAtom();
    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="max-h-[92svh] w-full overflow-y-auto sm:max-w-152">
                    <AlertDialogHeader>
                        <AlertDialogTitle>ニュースの編集</AlertDialogTitle>
                        <AlertDialogDescription>
                            マークダウンの詳しい書き方については
                            <Link href="/news/help" target="_blank" rel="noopener noreferrer" className="underline">
                                こちら
                            </Link>
                            をご覧ください。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Tabs defaultValue="metadata" className="mb-2 w-full">
                        <TabsList>
                            <TabsTrigger value="metadata">メタデータ</TabsTrigger>
                            <TabsTrigger value="content">内容</TabsTrigger>
                            <TabsTrigger value="preview">プレビュー</TabsTrigger>
                        </TabsList>
                        <TabsContent value="metadata">
                            <div className="grid min-h-[276px] gap-4">
                                <div className="grid gap-3">
                                    <Label>ID</Label>
                                    <Input
                                        disabled={!create}
                                        value={idValue}
                                        onChange={(e) => setIdValue(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label>タイトル</Label>
                                    <Input
                                        placeholder="タイトル"
                                        value={titleValue}
                                        onChange={(e) => setTitleValue(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label>日付</Label>
                                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-normal">
                                                {dateValue ? formatDate(dateValue) : "日付を選択"}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={dateValue}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    if (date) setDateValue(date);
                                                    setDatePickerOpen(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="grid gap-3">
                                    <Label>重要度</Label>
                                    <RadioGroup
                                        value={importanceValue === true ? "important" : "default"}
                                        className="flex flex-row gap-5"
                                        onValueChange={(value) => setImportanceValue(value === "important")}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="default" />
                                            <Label>通常</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="important" />
                                            <Label>重要</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="content" className="relative">
                            <Textarea
                                className="field-sizing-fixed h-[276px] resize-none overflow-y-scroll"
                                placeholder="内容 (マークダウン)"
                                value={contentValue}
                                wrap="off"
                                onChange={(e) => setContentValue(e.target.value)}
                            />
                        </TabsContent>
                        <TabsContent value="preview">
                            <NewsPreview content={contentValue} className="h-[276px]" />
                        </TabsContent>
                    </Tabs>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setOverwriteWarning(false);
                                setTimeout(() => {
                                    setTitleValue(placeholder.title);
                                    setContentValue(placeholder.content);
                                    setDateValue(placeholder.date);
                                    setImportanceValue(placeholder.importance);
                                    setIdValue(placeholder.id);
                                }, 100);
                            }}
                        >
                            キャンセル
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async (e) => {
                                e.preventDefault();
                                const parsed = newsSchema.safeParse({
                                    id: idValue,
                                    title: titleValue,
                                    content: contentValue,
                                    date: dateValue,
                                    importance: importanceValue,
                                });
                                if (!parsed.success) {
                                    toast.error(parsed.error.issues[0].message, {
                                        duration: 3000,
                                    });
                                    return;
                                }
                                if (create) {
                                    const result = await createNews(parsed.data);
                                    if (result === null) {
                                        toast.error("作成に失敗しました。", {
                                            duration: 2000,
                                        });
                                        return;
                                    }
                                    toast.success("追加しました。", {
                                        duration: 2000,
                                    });
                                    setOpen(false);
                                    initializer(false);
                                } else {
                                    const result = await updateNewsSafe(placeholder, parsed.data);
                                    if (result === null || result === UpdateResult.Invalid) {
                                        toast.error("保存に失敗しました。", {
                                            duration: 2000,
                                        });
                                        return;
                                    } else if (result === UpdateResult.Overwrite) {
                                        setOverwriteWarning(true);
                                        return;
                                    } else if (result === UpdateResult.NotFound) {
                                        toast.error("IDが見つかりません。", {
                                            duration: 2000,
                                        });
                                        return;
                                    } else if (result === UpdateResult.Success) {
                                        toast.success("保存しました。", {
                                            duration: 2000,
                                        });
                                    }
                                    setOpen(false);
                                    initializer(false);
                                }
                            }}
                        >
                            {create ? "作成" : "保存"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={overwriteWarning} onOpenChange={setOverwriteWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ニュースは変更されています</AlertDialogTitle>
                        <AlertDialogDescription>
                            このニュースは他の管理者によって編集された可能性があります。
                            <br />
                            上書きしてもよろしいですか？
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                const parsed = newsSchema.safeParse({
                                    id: idValue,
                                    title: titleValue,
                                    content: contentValue,
                                    date: dateValue,
                                    importance: importanceValue,
                                });
                                if (!parsed.success) {
                                    toast.error(parsed.error.issues[0].message, {
                                        duration: 3000,
                                    });
                                    return;
                                }
                                const result = await updateNewsUnsafe(parsed.data);
                                if (result) {
                                    toast.success("保存しました。", {
                                        duration: 2000,
                                    });
                                    setOpen(false);
                                    initializer(false);
                                } else {
                                    toast.error("保存に失敗しました。", {
                                        duration: 2000,
                                    });
                                }
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

function NewsContent({ news }: { news: NewsModel }) {
    const { id, date, title, content } = news;
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const initializer = useInitNewsAtom();
    return (
        <TableRow key={id}>
            <TableCell>
                <p className="w-32">{formatDate(date)}</p>
            </TableCell>
            <TableCell>
                <p className="w-96 overflow-hidden text-ellipsis">{title}</p>
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-8 p-0">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.preventDefault();
                                setOpenEditDialog(true);
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
                        <NewsEditor open={openEditDialog} setOpen={setOpenEditDialog} placeholder={news} />
                        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                            <AlertDialogContent className="sm:max-w-152">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                                    <AlertDialogDescription className="mb-2">
                                        この操作は取り消せません。
                                        <br />
                                        削除すると、ニュースの内容が完全に失われます。
                                    </AlertDialogDescription>
                                    <NewsPreview content={content} className="max-h-[50svh]" />
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={async () => {
                                            const result = await deleteNews(id);
                                            if (result) {
                                                toast.success("削除しました。", {
                                                    duration: 2000,
                                                });
                                                initializer(false);
                                            } else {
                                                toast.error("削除に失敗しました。", {
                                                    duration: 2000,
                                                });
                                            }
                                        }}
                                    >
                                        削除
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

export default function NewsViewer({ initialnews }: { initialnews: NewsModel[] }) {
    useHydrateAtoms([[newsAtom, initialnews]]);
    const news = useAtomValue(newsAtom);
    const initializer = useInitNewsAtom();
    const [editorOpen, setEditorOpen] = useState(false);
    const [newsid, setNewsId] = useState("");
    const [newsDate, setNewsDate] = useState(currentDate());
    return (
        <>
            <div className="mx-auto w-full max-w-[calc(100vw-2rem)] sm:w-208">
                <h1 className="mt-2 mb-4 w-full text-center text-4xl font-bold">ニュース</h1>
                <div className="mb-1 flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setNewsId(createId());
                            setNewsDate(currentDate());
                            setEditorOpen(true);
                        }}
                    >
                        <ListPlus />
                        追加
                    </Button>
                    <Separator orientation="vertical" className="h-6!" />
                    <Button variant="ghost" size="sm" onClick={() => initializer()}>
                        <ListRestart />
                        更新
                    </Button>
                </div>
                <Card className="mt-2 py-1">
                    <CardContent className="overflow-hidden rounded-xl px-1">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>日付</TableHead>
                                    <TableHead>タイトル</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {news.map((item) => {
                                    return <NewsContent key={item.id} news={item} />;
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <NewsEditor
                open={editorOpen}
                setOpen={setEditorOpen}
                placeholder={{
                    id: newsid,
                    title: "",
                    content: "",
                    date: newsDate,
                    importance: false,
                }}
                create
            />
        </>
    );
}
