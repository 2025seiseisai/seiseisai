import { auth } from "@/impl/auth";
import { getAllNews } from "@/impl/database";
import { notFound } from "next/navigation";
import NewsViewer from "./viewer";

export const dynamic = "force-dynamic";

export default async function Page() {
    if (!(await auth())?.authorityNews) notFound();
    const news = await getAllNews();
    return (
        <>
            <NewsViewer initialnews={news} />
        </>
    );
}
