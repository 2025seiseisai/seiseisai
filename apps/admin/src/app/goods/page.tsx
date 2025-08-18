import { auth, SessionProvider } from "@/impl/auth";
import { getAllGoods } from "@seiseisai/database";
import { notFound } from "next/navigation";
import GoodsViewer from "./viewer";

export default async function GoodsPage() {
    const session = await auth();
    if (!session || (!session.authorityGoods && !session.authorityGoodsStock)) notFound();
    const goods = await getAllGoods();
    return (
        <SessionProvider>
            <GoodsViewer initgoods={goods} />
        </SessionProvider>
    );
}
