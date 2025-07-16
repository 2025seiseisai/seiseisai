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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { NewsModel } from "@/impl/database";
import { YouTubeEmbed } from "@next/third-parties/google";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import Markdown from "react-markdown";
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

function NewsPreview({ content }: { content: string }) {
    const components = {
        h1: ({ children }: { children: any }) => {
            return <h1 className="news_element">{transformLinks(children)}</h1>;
        },
        h2: ({ children }: { children: any }) => {
            return <h2 className="news_element">{transformLinks(children)}</h2>;
        },
        h3: ({ children }: { children: any }) => {
            return <h3 className="news_element">{transformLinks(children)}</h3>;
        },
        h4: ({ children }: { children: any }) => {
            return <h4 className="news_element">{transformLinks(children)}</h4>;
        },
        h5: ({ children }: { children: any }) => {
            return <h5 className="news_element">{transformLinks(children)}</h5>;
        },
        h6: ({ children }: { children: any }) => {
            return <h6 className="news_element">{transformLinks(children)}</h6>;
        },
        p: ({ children }: { children: any }) => {
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
        ul: ({ children }: { children: any }) => {
            return <ul className="news_element">{children}</ul>;
        },
        li: ({ children }: { children: any }) => {
            return <li className="news_element">{children}</li>;
        },
        ol: ({ children }: { children: any }) => {
            return <ol className="news_element">{children}</ol>;
        },
        strong: ({ children }: { children: any }) => {
            return (
                <span className="news_element" style={{ fontWeight: 600 }}>
                    {children}
                </span>
            );
        },
    };
    return (
        <article className="max-h-[50svh] overflow-y-scroll rounded-md border p-4">
            <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content.replaceAll("\\n", "\n")}</Markdown>
        </article>
    );
}

function NewsContent({ news: { id, date, title, content } }: { news: NewsModel }) {
    const [openDialog, setOpenDialog] = useState(false);
    return (
        <TableRow key={id}>
            <TableCell>
                <p className="w-32">
                    {`${new Date(date).getFullYear()}/${String(new Date(date).getMonth() + 1).padStart(2, "0")}/${String(new Date(date).getDate()).padStart(2, "0")}`}
                </p>
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
                        <DropdownMenuItem>
                            <Pencil />
                            編集
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={(e) => {
                                e.preventDefault();
                                setOpenDialog(true);
                            }}
                        >
                            <Trash2 />
                            削除
                        </DropdownMenuItem>
                        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        この操作は取り消せません。
                                        <br />
                                        削除すると、ニュースの内容が完全に失われます。
                                    </AlertDialogDescription>
                                    <NewsPreview content={content} />
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
        <Table className="mx-auto mt-6 w-156">
            <TableHeader>
                <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>タイトル</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {news.map((item) => {
                    return <NewsContent key={item.id} news={item} />;
                })}
            </TableBody>
        </Table>
    );
}
