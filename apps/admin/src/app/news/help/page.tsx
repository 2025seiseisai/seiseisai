import { auth } from "@/impl/auth";
import { notFound } from "next/navigation";

export default async function HelpPage() {
    if (!(await auth())?.authorityNews) notFound();

    return (
        <div className="mx-auto w-full max-w-[calc(100vw-2rem)] overflow-hidden sm:w-[52rem]">
            <h1 className="mt-2 mb-4 w-full text-center text-4xl font-bold">ニュース</h1>
            <h2 className="scroll-mt-16 text-2xl font-semibold">マークダウンの書き方</h2>
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
                    <span className="font-semibold">ダウンロードリンク:</span> 一般的なファイル拡張子 (<code>.pdf</code>
                    , <code>.zip</code> など) で終わるURLは、ダウンロードリンクとして扱われます。
                </li>
                <li>
                    <span className="font-semibold">メールリンク:</span> <code>mailto:</code>{" "}
                    で始まるリンクは、メールアドレスへのリンクとして扱われます。
                </li>
            </ul>
        </div>
    );
}
