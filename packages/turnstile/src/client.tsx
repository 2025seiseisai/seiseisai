"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

export default function TurnstileWidget({
    siteKey,
    onVerify,
    onError = () => {},
    theme = "light",
    className = "",
}: {
    siteKey: string;
    onVerify: (token: string) => void;
    onError?: () => void;
    theme?: "light" | "dark" | "auto";
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const renderedRef = useRef(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        if (!scriptLoaded || renderedRef.current || !ref.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const turnstile = (window as any).turnstile;
        if (!turnstile) {
            console.error("Turnstile script not loaded");
            return;
        }
        turnstile.render(ref.current, {
            sitekey: siteKey,
            callback: onVerify,
            "error-callback": onError,
            theme: theme,
        });
        renderedRef.current = true;
    }, [scriptLoaded, siteKey, onVerify, onError, theme]);

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
