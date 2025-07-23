import { getAllNews } from "@/impl/database";
import NewsViewer from "./viewer";

export const dynamic = "force-dynamic";

export default async function Page() {
    //if (!(await getAuthSession())?.authorityNews) notFound();

    const news = await getAllNews();
    return (
        <>
            <NewsViewer initialnews={news} />
        </>
    );
}
