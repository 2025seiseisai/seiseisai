"use client";

export default function ErrorPage() {
    return (
        <div className="mx-auto flex w-[calc(100%-40px)] flex-1 items-center justify-center bg-white">
            <div className="text-center">
                <h1 className="text-3xl font-bold sm:text-4xl">Internal Server Error</h1>
                <p className="mt-4 sm:text-lg">時間を置いてもう一度お試しください。</p>
            </div>
        </div>
    );
}
