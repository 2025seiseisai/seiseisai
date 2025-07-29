"use client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminModel, type NewsModel } from "@/impl/database";
import { deleteNews, getAllAdmins } from "@/impl/database-actions";
import { createId } from "@paralleldrive/cuid2";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { ListPlus, ListRestart, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const adminsAtom = atom<AdminModel[]>([]);

function useInitAdminsAtom() {
    const setAdmins = useSetAtom(adminsAtom);
    return async (showSuccessToast = true) => {
        const fetchedAdmins = await getAllAdmins();
        if (fetchedAdmins) {
            setAdmins(fetchedAdmins);
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

/*
function AdminEditor({
    open,
    setOpen,
    placeholder,
    create = false,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    placeholder: AdminModel;
    create?: boolean;
}) {
    const [idValue, setIdValue] = useState(placeholder.id);
    const [overwriteWarning, setOverwriteWarning] = useState(false);
    const initializer = useInitAdminsAtom();
    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="w-full sm:max-w-[38rem]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>管理者情報の編集</AlertDialogTitle>
                        <AlertDialogDescription>
                            マークダウンの詳しい書き方については
                            <Link href="/news#help" target="_blank" rel="noopener noreferrer" className="underline">
                                こちら
                            </Link>
                            をご覧ください。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
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
                                        toast.error("ニュースの作成に失敗しました。", {
                                            duration: 2000,
                                        });
                                        return;
                                    }
                                    toast.success("ニュースを追加しました。", {
                                        duration: 2000,
                                    });
                                    setOpen(false);
                                    initializer(false);
                                } else {
                                    const result = await updateNewsSafe(placeholder, parsed.data);
                                    if (result === null || result === ChangeNewsSafeResult.Invalid) {
                                        toast.error("ニュースの保存に失敗しました。", {
                                            duration: 2000,
                                        });
                                        return;
                                    } else if (result === ChangeNewsSafeResult.Overwrite) {
                                        setOverwriteWarning(true);
                                        return;
                                    } else if (result === ChangeNewsSafeResult.NotFound) {
                                        toast.error("ニュースが見つかりません。", {
                                            duration: 2000,
                                        });
                                        return;
                                    } else if (result === ChangeNewsSafeResult.Success) {
                                        toast.success("ニュースを保存しました。", {
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
                <AlertDialogContent className="">
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
                                    toast.success("ニュースを保存しました。", {
                                        duration: 2000,
                                    });
                                    setOpen(false);
                                    initializer(false);
                                } else {
                                    toast.error("ニュースの保存に失敗しました。", {
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
*/

function NewsContent({ admin }: { admin: AdminModel }) {
    const { id } = admin;
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const initializer = useInitAdminsAtom();
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
                        <Button variant="ghost" className="h-8 w-8 p-0">
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
                            <AlertDialogContent className="sm:max-w-[38rem]">
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
                                                toast.success("ニュースを削除しました。", {
                                                    duration: 2000,
                                                });
                                                initializer(false);
                                            } else {
                                                toast.error("ニュースの削除に失敗しました。", {
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

export function NewsViewer({ initialnews }: { initialnews: NewsModel[] }) {
    useHydrateAtoms([[newsAtom, initialnews]]);
    const news = useAtomValue(newsAtom);
    const initializer = useInitNewsAtom();
    const [openEditor, setOpenEditor] = useState(false);
    const [newsid, setNewsId] = useState(createId());
    const [newsDate, setNewsDate] = useState(new Date());
    return (
        <>
            <div className="mx-auto w-full max-w-[calc(100vw-2rem)] sm:w-[39rem]">
                <h1 className="mt-2 mb-4 w-full text-center text-4xl font-bold">ニュース</h1>
                <div className="mb-1 flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setOpenEditor(true);
                            setNewsId(createId());
                            setNewsDate(new Date());
                        }}
                    >
                        <ListPlus />
                        追加
                    </Button>
                    <Separator orientation="vertical" className="!h-6" />
                    <Button variant="ghost" size="sm" onClick={() => initializer()}>
                        <ListRestart />
                        更新
                    </Button>
                </div>
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
                <div className="w-full overflow-hidden">
                    <h2 id="help" className="mt-8 scroll-m-16 text-2xl font-semibold">
                        マークダウンの書き方
                    </h2>
                    <p className="mt-2">
                        基本的なマークダウン記法に加えて、YouTubeやX (旧Twitter) の埋め込みにも対応しています。
                    </p>
                    <h3 className="mt-4 text-xl font-semibold">基本的な記法</h3>
                    <p className="mt-2">見出し、太字、打ち消し、リンクなどの基本的なマークダウン記法が使用できます。</p>
                    <pre className="mt-2 rounded-md border bg-white p-4 text-sm text-slate-950">
                        <code>
                            本文のテキスト{"\n"}
                            {"\n"}# 見出し1{"\n"}
                            ## 見出し2{"\n"}
                            {"\n"}
                            **太字**
                            {"\n"}
                            ~~打ち消し~~
                            {"\n"}
                            {"\n"}[外部リンク](https://example.com){"\n"}
                            [内部リンク](/path/to/page){"\n"}
                            [メールリンク](mailto:example@gmail.com){"\n"}
                            [ダウンロードリンク](https://example.com/file.zip)
                        </code>
                    </pre>

                    <h3 className="mt-4 text-xl font-semibold">埋め込み</h3>
                    <p className="mt-2">
                        YouTubeの動画やXの投稿を埋め込むには、URLをそのまま貼り付けてください。URLは他のテキストと1行開ける必要があります。
                    </p>

                    <h4 className="mt-3 text-lg font-semibold">YouTube</h4>
                    <p className="mt-1 text-sm">以下の形式のURLに対応しています。</p>
                    <pre className="mt-2 rounded-md border bg-white p-4 text-sm text-slate-950">
                        <code>
                            https://www.youtube.com/watch?v=...{"\n"}
                            https://youtu.be/...
                        </code>
                    </pre>

                    <h4 className="mt-3 text-lg font-semibold">X (旧Twitter)</h4>
                    <p className="mt-1 text-sm">以下の形式のURLに対応しています。</p>
                    <pre className="mt-2 rounded-md border bg-white p-4 text-sm text-slate-950">
                        <code>
                            https://x.com/ユーザー名/status/ツイートID{"\n"}
                            https://twitter.com/ユーザー名/status/ツイートID
                        </code>
                    </pre>

                    <h3 className="mt-4 text-xl font-semibold">リンクの挙動</h3>
                    <p className="mt-2 text-sm">リンクはURLに応じて自動的に処理されます。</p>
                    <ul className="mt-2 mb-4 list-disc space-y-1 pl-6 text-sm">
                        <li>
                            <span className="font-semibold">外部リンク:</span> <code>seiseisai.com</code>{" "}
                            以外のドメインへのリンクは、新しいタブで開かれます。
                        </li>
                        <li>
                            <span className="font-semibold">内部リンク:</span> <code>/path/to/page</code>{" "}
                            のような相対パスは、自動的にサイト内のページへのリンクに変換されます。
                        </li>
                        <li>
                            <span className="font-semibold">ダウンロードリンク:</span> 一般的なファイル拡張子 (
                            <code>.pdf</code>, <code>.zip</code> など)
                            で終わるURLは、ダウンロードリンクとして扱われます。
                        </li>
                        <li>
                            <span className="font-semibold">メールリンク:</span> <code>mailto:</code>{" "}
                            で始まるリンクは、メールアドレスへのリンクとして扱われます。
                        </li>
                    </ul>
                </div>
            </div>
            <NewsEditor
                open={openEditor}
                setOpen={setOpenEditor}
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

export default function AdminsViewer({ initialadmins }: { initialadmins: AdminModel[] }) {
    return (
        <>
            <h1>Admins Viewer</h1>
        </>
    );
}
