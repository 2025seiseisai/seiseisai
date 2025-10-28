import { auth } from "@/impl/auth";
import { notFound } from "next/navigation";

export default async function Page() {
    if (!(await auth())?.authorityTickets) notFound();
    return (
        <div className="mx-auto w-full max-w-[calc(100vw-2rem)] overflow-hidden sm:w-208">
            <h1 className="mt-2 mb-4 w-full text-center text-4xl font-bold">整理券</h1>
            <h2 className="scroll-mt-16 text-2xl font-semibold">イベントの設定</h2>
            <h3 className="mt-4 text-xl font-semibold">イベント名</h3>
            <p className="mt-2">表示する名前を記載してください。</p>
            <h3 className="mt-4 text-xl font-semibold">リンク</h3>
            <p className="mt-2">イベントの詳細ページなどへのリンクを記載してください。なければ空にしてください。</p>
            <h3 className="mt-4 text-xl font-semibold">応募開始日時</h3>
            <p className="mt-2">応募を開始する日時を選択してください。</p>
            <h3 className="mt-4 text-xl font-semibold">応募終了日時</h3>
            <p className="mt-2">応募を終了する日時を選択してください。応募開始日時より後である必要があります。</p>
            <h3 className="mt-4 text-xl font-semibold">引き換え終了日時</h3>
            <p className="mt-2">
                Web整理券から紙の整理券への引き換えを終了する日時を選択してください。応募終了日時より後である必要があります。
            </p>
            <h3 className="mt-4 text-xl font-semibold">定員</h3>
            <p className="mt-2">当選者数の上限を設定してください。</p>
            <h3 className="mt-4 text-xl font-semibold">1人あたりの最大応募枚数</h3>
            <p className="mt-2">
                1人あたりが応募できる紙の整理券の最大枚数を設定してください。(Web整理券は1人1つまでしか応募できません。Web整理券1枚に何枚の紙の整理券を引き換えできるかを指定します。)
            </p>
            <h3 className="mt-4 text-xl font-semibold">整理券種類</h3>
            <ul className="mt-2 mb-4 list-disc space-y-1 pl-6">
                <li>個人制: 1枚の紙の整理券で1人が参加可能 (同伴者も整理券が必要)</li>
                <li>参加者制: 1枚の紙の整理券で参加者1人が参加可能 (同伴者は整理券不要)</li>
                <li>グループ制: 1枚の紙の整理券で1グループ(最大5人まで)が参加可能</li>
            </ul>
        </div>
    );
}
