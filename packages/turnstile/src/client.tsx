"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

export default function TurnstileWidget({
    siteKey,
    onVerify,
    theme = "light",
    className = "",
}: {
    siteKey: string;
    onVerify: (token: string) => void;
    theme?: "light" | "dark" | "auto";
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [rendered, setRendered] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        if (!scriptLoaded || rendered || !ref.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(window as any).turnstile) {
            console.error("Turnstile script not loaded");
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).turnstile.render(ref.current, {
            sitekey: siteKey,
            callback: onVerify,
            theme: theme,
        });
        setRendered(true);
    }, [scriptLoaded, rendered, siteKey, onVerify, theme]);

    return (
        <>
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                onLoad={() => setScriptLoaded(true)}
                async
            />
            <div ref={ref} className={className}></div>
        </>
    );
}
