import dbClient from "@/impl/database";
import NewsViewer from "./viewer";

export const dynamic = "force-dynamic";

export default async function Page() {
    const news = await dbClient.news.findMany({
        orderBy: {
            date: "desc",
        },
    });
    return (
        <>
            <h1 className="mx-auto mt-2 text-4xl font-bold">ニュース</h1>
            <NewsViewer news={news} />
        </>
    );
}
