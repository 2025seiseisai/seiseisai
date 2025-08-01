"use client";
/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint better-tailwindcss/no-unregistered-classes: 0 */
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
import { Calendar } from "@/components/ui/calendar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createNews, deleteNews, getAllNews, updateNewsSafe, updateNewsUnsafe } from "@/impl/database-actions";
import type { NewsModel } from "@/impl/models";
import { UpdateResult } from "@/impl/update-result";
import { cn } from "@/lib/utils";
import { YouTubeEmbed } from "@next/third-parties/google";
import { createId } from "@paralleldrive/cuid2";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { ChevronDownIcon, ListPlus, ListRestart, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import Markdown, { Components } from "react-markdown";
import { Tweet } from "react-tweet";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
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

function transformLinks(node: React.ReactNode): React.ReactNode {
    if (typeof node === "string" || typeof node === "number") {
        return node;
    }
    if (Array.isArray(node)) {
        return node.map((child, i) => <React.Fragment key={i}>{transformLinks(child)}</React.Fragment>);
    }

    if (React.isValidElement(node) && node.type === "a" && (node.props as any).href) {
        const { href, children } = node.props as {
            href: string;
            children: React.ReactNode;
        };
        if (href[0] === "#" || href.startsWith("mailto:")) {
            return (
                <a href={href} className="news_element">
                    {transformLinks(children)}
                </a>
            );
        }
        if (
            (href.startsWith("https://") || href.startsWith("http://")) &&
            href.split("/").at(-1)?.includes(".") &&
            !href.endsWith(".html") &&
            !href.endsWith(".htm") &&
            !href.endsWith(".php")
        ) {
            return (
                <Link href={href} download className="news_element">
                    {transformLinks(children)}
                </Link>
            );
        }
        if (
            (href.startsWith("https://") || href.startsWith("http://")) &&
            !href.startsWith("https://seiseisai.com") &&
            !href.startsWith("http://seiseisai.com")
        ) {
            return (
                <Link href={href} target="_blank" rel="noopener noreferrer nofollow" className={"news_element"}>
                    {transformLinks(children)}
                </Link>
            );
        }
        if (href.startsWith("/")) {
            return (
                <Link href={"https://seiseisai.com" + href} className="news_element">
                    {transformLinks(children)}
                </Link>
            );
        }
        return (
            <Link href={href} className="news_element">
                {transformLinks(children)}
            </Link>
        );
    }

    return node;
}

function NewsPreview({ content, className = "" }: { content: string; className?: string }) {
    const components: Components = {
        h1: ({ children }) => {
            return <h1 className="news_element">{transformLinks(children)}</h1>;
        },
        h2: ({ children }) => {
            return <h2 className="news_element">{transformLinks(children)}</h2>;
        },
        h3: ({ children }) => {
            return <h3 className="news_element">{transformLinks(children)}</h3>;
        },
        h4: ({ children }) => {
            return <h4 className="news_element">{transformLinks(children)}</h4>;
        },
        h5: ({ children }) => {
            return <h5 className="news_element">{transformLinks(children)}</h5>;
        },
        h6: ({ children }) => {
            return <h6 className="news_element">{transformLinks(children)}</h6>;
        },
        p: ({ children }) => {
            if (Array.isArray(children)) {
                return <div className="news_element">{transformLinks(children)}</div>;
            }
            if (React.isValidElement(children)) {
                const type = (children as React.ReactElement).type;
                const props = children.props as any;
                if ((type as any).name === "img") {
                    return children;
                }
                if (type === "a" && props.href) {
                    const { href, children } = props as {
                        href: string;
                        children: React.ReactNode;
                    };
                    if (
                        children === href &&
                        (href.startsWith("https://youtube.com/watch?v=") ||
                            href.startsWith("https://www.youtube.com/watch?v="))
                    ) {
                        return (
                            <section className="news_youtube_embed">
                                <YouTubeEmbed videoid={href.split("?v=").at(-1) || ""} />
                            </section>
                        );
                    }
                    if (children === href && href.startsWith("https://youtu.be/")) {
                        return (
                            <section className="news_youtube_embed">
                                <YouTubeEmbed videoid={href.split("/").at(-1) || ""} />
                            </section>
                        );
                    }
                    if (
                        children === href &&
                        href.match(/^https?:\/\/(x\.com|twitter\.com)\/[a-zA-Z0-9_]+\/status\/\d+/)
                    ) {
                        const tweetId = href.match(/status\/(\d+)/)?.[1];
                        if (tweetId) {
                            return (
                                <section className="news_tweet_embed" data-theme={"light"} suppressHydrationWarning>
                                    <Tweet id={tweetId} />
                                </section>
                            );
                        }
                    }
                    if (href[0] === "#" || href.startsWith("mailto:")) {
                        return (
                            <div className="news_element">
                                <a href={href} className="news_element">
                                    {transformLinks(children)}
                                </a>
                            </div>
                        );
                    }
                    if (
                        (href.startsWith("https://") || href.startsWith("http://")) &&
                        href.split("/").at(-1)?.includes(".") &&
                        !href.endsWith(".html") &&
                        !href.endsWith(".htm") &&
                        !href.endsWith(".php")
                    ) {
                        return (
                            <div className="news_element">
                                <Link href={href} download className={""}>
                                    {transformLinks(children)}
                                </Link>
                            </div>
                        );
                    }
                    if (
                        (href.startsWith("https://") || href.startsWith("http://")) &&
                        !href.startsWith("https://seiseisai.com") &&
                        !href.startsWith("http://seiseisai.com")
                    ) {
                        return (
                            <div className="news_element">
                                <Link
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow"
                                    className="news_element"
                                >
                                    {transformLinks(children)}
                                </Link>
                            </div>
                        );
                    }
                    if (href.startsWith("/")) {
                        return (
                            <div className="news_element">
                                <Link href={"https://seiseisai.com" + href} className="news_element">
                                    {transformLinks(children)}
                                </Link>
                            </div>
                        );
                    }
                    return (
                        <div className="news_element">
                            <Link href={href} className="news_element">
                                {transformLinks(children)}
                            </Link>
                        </div>
                    );
                }
            }
            return <div className="news_element">{transformLinks(children)}</div>;
        },
        ul: ({ children }) => {
            return <ul className="news_element">{children}</ul>;
        },
        li: ({ children }) => {
            return <li className="news_element">{children}</li>;
        },
        ol: ({ children }) => {
            return <ol className="news_element">{children}</ol>;
        },
        strong: ({ children }) => {
            return (
                <span className="news_element" style={{ fontWeight: 600 }}>
                    {children}
                </span>
            );
        },
    };
    return (
        <article className={cn("overflow-y-scroll rounded-md border p-4 text-start", className)}>
            <Markdown components={components} remarkPlugins={[remarkGfm, remarkBreaks]}>
                {content}
            </Markdown>
        </article>
    );
}

function formatDate(date: Date | string): string {
    const d = new Date(date);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function currentDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
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
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [overwriteWarning, setOverwriteWarning] = useState(false);
    const initializer = useInitNewsAtom();
    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="w-full sm:max-w-[38rem]">
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
    const [openEditor, setOpenEditor] = useState(false);
    const [newsid, setNewsId] = useState("");
    const [newsDate, setNewsDate] = useState(currentDate());
    return (
        <>
            <div className="mx-auto w-full max-w-[calc(100vw-2rem)] sm:w-[39rem]">
                <h1 className="mt-2 mb-4 w-full text-center text-4xl font-bold">ニュース</h1>
                <div className="mb-1 flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setNewsId(createId());
                            setNewsDate(currentDate());
                            setOpenEditor(true);
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
