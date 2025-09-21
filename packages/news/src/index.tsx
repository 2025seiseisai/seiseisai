/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint better-tailwindcss/no-unregistered-classes: 0 */
import { YouTubeEmbed } from "@next/third-parties/google";
import { cn } from "@seiseisai/ui/lib/utils";
import Link from "next/link";
import React from "react";
import Markdown, { Components } from "react-markdown";
import { Tweet } from "react-tweet";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

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
                <a href={href} className="news-element">
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
                <Link href={href as any} download className="news-element">
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
                <Link href={href as any} target="_blank" rel="noopener noreferrer nofollow" className={"news-element"}>
                    {transformLinks(children)}
                </Link>
            );
        }
        if (href.startsWith("/")) {
            return (
                <Link href={("https://seiseisai.com" + href) as any} className="news-element">
                    {transformLinks(children)}
                </Link>
            );
        }
        return (
            <Link href={href as any} className="news-element">
                {transformLinks(children)}
            </Link>
        );
    }

    return node;
}

export default function NewsPreview({ content, className = "" }: { content: string; className?: string }) {
    const components: Components = {
        h1: ({ children }) => {
            return <h1 className="news-element">{transformLinks(children)}</h1>;
        },
        h2: ({ children }) => {
            return <h2 className="news-element">{transformLinks(children)}</h2>;
        },
        h3: ({ children }) => {
            return <h3 className="news-element">{transformLinks(children)}</h3>;
        },
        h4: ({ children }) => {
            return <h4 className="news-element">{transformLinks(children)}</h4>;
        },
        h5: ({ children }) => {
            return <h5 className="news-element">{transformLinks(children)}</h5>;
        },
        h6: ({ children }) => {
            return <h6 className="news-element">{transformLinks(children)}</h6>;
        },
        p: ({ children }) => {
            if (Array.isArray(children)) {
                return <div className="news-element">{transformLinks(children)}</div>;
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
                            <section className="news-youtube-embed">
                                <YouTubeEmbed videoid={href.split("?v=").at(-1) || ""} />
                            </section>
                        );
                    }
                    if (children === href && href.startsWith("https://youtu.be/")) {
                        return (
                            <section className="news-youtube-embed">
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
                                <section className="news-tweet-embed" data-theme={"light"} suppressHydrationWarning>
                                    <Tweet id={tweetId} />
                                </section>
                            );
                        }
                    }
                    if (href[0] === "#" || href.startsWith("mailto:")) {
                        return (
                            <div className="news-element">
                                <a href={href} className="news-element">
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
                            <div className="news-element">
                                <Link href={href as any} download className={""}>
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
                            <div className="news-element">
                                <Link
                                    href={href as any}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow"
                                    className="news-element"
                                >
                                    {transformLinks(children)}
                                </Link>
                            </div>
                        );
                    }
                    if (href.startsWith("/")) {
                        return (
                            <div className="news-element">
                                <Link href={("https://seiseisai.com" + href) as any} className="news-element">
                                    {transformLinks(children)}
                                </Link>
                            </div>
                        );
                    }
                    return (
                        <div className="news-element">
                            <Link href={href as any} className="news-element">
                                {transformLinks(children)}
                            </Link>
                        </div>
                    );
                }
            }
            return <div className="news-element">{transformLinks(children)}</div>;
        },
        ul: ({ children }) => {
            return <ul className="news-element">{children}</ul>;
        },
        li: ({ children }) => {
            return <li className="news-element">{children}</li>;
        },
        ol: ({ children }) => {
            return <ol className="news-element">{children}</ol>;
        },
        strong: ({ children }) => {
            return (
                <span className="news-element" style={{ fontWeight: 600 }}>
                    {children}
                </span>
            );
        },
    };
    return (
        <article className={cn("news-article overflow-y-scroll rounded-md border p-4 text-start", className)}>
            <Markdown components={components} remarkPlugins={[remarkGfm, remarkBreaks]}>
                {content}
            </Markdown>
        </article>
    );
}
