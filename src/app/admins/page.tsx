import { getAuthSession } from "@/impl/auth";
import { getAllAdmins } from "@/impl/database";
import { notFound } from "next/navigation";
import AdminsViewer from "./viewer";

export const dynamic = "force-dynamic";

export default async function Page() {
    if (!(await getAuthSession())?.authorityAdmins) notFound();
    const admins = await getAllAdmins();
    return (
        <>
            <AdminsViewer initialadmins={admins} />
        </>
    );
}
