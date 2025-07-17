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
import type { NewsModel } from "@/impl/database";
import { cn } from "@/lib/utils";
import { YouTubeEmbed } from "@next/third-parties/google";
import { ChevronDownIcon, ListPlus, ListRestart, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import Markdown, { Components } from "react-markdown";
import { Tweet } from "react-tweet";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import "./news.scss";

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
                <Link href={href} target="_blank" rel="noopener noreferrer nofollow" className={" news_element "}>
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
                {content.replaceAll("\\n", "\n")}
            </Markdown>
        </article>
    );
}

function FormatDate(date: Date | string): string {
    const d = new Date(date);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function NewsEditor({
    open,
    onOpenChange,
    placeholder,
    create = false,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    placeholder: NewsModel;
    create?: boolean;
}) {
    const { id } = placeholder;
    const [dateValue, setDateValue] = React.useState<Date | undefined>(
        placeholder.date ? new Date(placeholder.date) : undefined,
    );
    const [contentValue, setContentValue] = React.useState<string>(
        placeholder.content
            ? placeholder.content.replaceAll("\\n", "\n")
            : "# ニュースの例\n\nこれはニュースの例です。\n\n[リンク](https://example.com)\n",
    );
    const [datePickerOpen, setDatePickerOpen] = React.useState(false);
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[38rem]">
                <AlertDialogHeader>
                    <AlertDialogTitle>ニュースの編集</AlertDialogTitle>
                    <AlertDialogDescription>
                        マークダウンの詳しい書き方については
                        <Link href="/news#help" target="_blank" rel="noopener noreferrer" className="underline">
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
                                <Input defaultValue={id} disabled={!create} />
                            </div>
                            <div className="grid gap-3">
                                <Label>タイトル</Label>
                                <Input defaultValue={placeholder.title} placeholder="タイトル" />
                            </div>
                            <div className="grid gap-3">
                                <Label>日付</Label>
                                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between font-normal">
                                            {dateValue ? FormatDate(dateValue) : "日付を選択"}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dateValue}
                                            captionLayout="dropdown"
                                            onSelect={(date) => {
                                                setDateValue(date);
                                                setDatePickerOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-3">
                                <Label>重要度</Label>
                                <RadioGroup
                                    defaultValue={
                                        placeholder.importance === true
                                            ? "news_editor_importance_radio_group_important"
                                            : "news_editor_importance_radio_group_default"
                                    }
                                    className="flex flex-row gap-5"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="news_editor_importance_radio_group_default" />
                                        <Label>通常</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="news_editor_importance_radio_group_important" />
                                        <Label>重要</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="content">
                        <Textarea
                            className="h-[276px] resize-none overflow-scroll"
                            placeholder="内容 (マークダウン)"
                            value={contentValue}
                            onChange={(e) => setContentValue(e.target.value)}
                        />
                    </TabsContent>
                    <TabsContent value="preview">
                        <NewsPreview content={contentValue} className="h-[276px]" />
                    </TabsContent>
                </Tabs>
                <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction>保存</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function NewsContent({ news }: { news: NewsModel }) {
    const { id, date, title, content } = news;
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    return (
        <TableRow key={id}>
            <TableCell>
                <p className="w-32">{FormatDate(date)}</p>
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
                        <NewsEditor open={openEditDialog} onOpenChange={setOpenEditDialog} placeholder={news} />
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
                                    <AlertDialogAction>削除</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

export default function NewsViewer({ news }: { news: NewsModel[] }) {
    return (
        <>
            <div className="mx-auto w-full max-w-[calc(100vw-2rem)] sm:w-[39rem]">
                <h1 className="mt-2 mb-4 w-full text-center text-4xl font-bold">ニュース</h1>
                <div className="mb-1 flex items-center gap-1.5">
                    <Button variant="ghost" size="sm">
                        <ListPlus className="" />
                        追加
                    </Button>
                    <Separator orientation="vertical" className="!h-6" />
                    <Button variant="ghost" size="sm">
                        <ListRestart className="" />
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
        </>
    );
}
