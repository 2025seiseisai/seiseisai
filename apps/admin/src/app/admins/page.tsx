import { auth } from "@/impl/auth";
import { getAllAdmins } from "@seiseisai/database";
import { notFound } from "next/navigation";
import AdminsViewer from "./viewer";

export default async function Page() {
    if (!(await auth())?.authorityAdmins) notFound();
    const admins = await getAllAdmins();
    return (
        <>
            <AdminsViewer initialadmins={admins} />
        </>
    );
}
