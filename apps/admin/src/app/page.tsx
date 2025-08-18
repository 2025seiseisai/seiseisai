import { auth } from "@/impl/auth";
import { Button } from "@seiseisai/ui/components/button";
import { LogIn } from "lucide-react";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default async function Page() {
    const session = await auth();
    return (
        <div className="flex w-full flex-1 items-center justify-center bg-white">
            <div className="text-center">
                <h1 className="text-4xl/normal font-bold">
                    菁々祭 Webサイト
                    <br />
                    管理ページ
                </h1>
                {!session && (
                    <>
                        <p className="mt-4 mb-6 text-lg">使用するにはログインする必要があります。</p>
                        <Button asChild className="w-[90%]" size="lg">
                            <Link href="/login">
                                <LogIn />
                                ログイン
                            </Link>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
