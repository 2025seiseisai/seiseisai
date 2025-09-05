export default async function Page() {
    return (
        <div className="mx-auto w-full max-w-[calc(100vw-2rem)] overflow-hidden sm:w-[52rem]">
            <h1 className="mt-2 mb-4 w-full text-center text-4xl font-bold">ご利用にあたって</h1>
            <p className="mt-2">ご利用にあたっては、以下の注意事項をよくお読みいただき、同意の上でご利用ください。</p>
            <h2 className="mt-8 w-full text-center text-3xl font-semibold">注意事項</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Web整理券は抽選制です。</li>
                <li>すでに応募したイベントと開催時間が被っているイベントは予約できませんのでご注意ください。</li>
                <li>
                    応募の受付開始はおおよそイベント開始の2時間前、締め切りは1時間前となっております。応募し忘れにご注意ください。
                </li>
                <li>
                    当選した場合、イベント開始前までに転心殿前インフォメーションにて紙の整理券との引き換えをお願いしたします。
                </li>
                <li>Web整理券は1人につき10枚までとさせていただいておきます。</li>
                <li>Web整理券は必ず使用する本人、もしくはその同伴者が応募してください。</li>
                <li>複数のデバイスを使用するなどして、複数回応募する行為は禁止されています。</li>
                <li>不正利用が発覚した場合、整理券を無効とし、今後のご利用をお断りする場合があります。</li>
            </ul>
        </div>
    );
}
