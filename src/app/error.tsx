"use client";

export default function ErrorPage() {
    return (
        <div className="flex w-full flex-1 items-center justify-center bg-white">
            <div className="text-center">
                <h1 className="text-4xl font-bold">Internal Server Error</h1>
                <p className="mt-4 text-lg">時間を置いてもう一度お試しください。</p>
            </div>
        </div>
    );
}
