import { auth } from "@/impl/auth";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth();
    if (session === null) {
        return (
            <div className="mx-auto flex w-[calc(100%-40px)] flex-1 items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold sm:text-4xl">認証されていません</h1>
                    <p className="mt-4 text-center sm:text-lg">
                        Web整理券を利用するには、転心殿前インフォメーションに設置されているiPadに表示されているQRコードを読み込んでください。
                    </p>
                </div>
            </div>
        );
    }
    redirect("/");
}
