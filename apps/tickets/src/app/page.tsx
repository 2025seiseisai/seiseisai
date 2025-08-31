import { auth } from "@/impl/auth";

export default async function Page() {
    const id = await auth();
    if (id === null) {
        return (
            <div className="mx-auto flex w-[calc(100%-40px)] flex-1 items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold sm:text-4xl">未認証</h1>
                    <p className="mt-4 text-center sm:text-lg">
                        このページを表示するには認証が必要です。
                        <br />
                        お手数をおかけしますが、QRコードをもう一度読み込んでください。
                    </p>
                </div>
            </div>
        );
    }
}
