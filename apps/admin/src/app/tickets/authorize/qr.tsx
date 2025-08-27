"use client";
import { cn } from "@seiseisai/ui/lib/utils";
import crypto from "crypto";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import styles from "./spinner.module.scss";

export default function AuthenticationQR({ className, hmacKey }: { className?: string; hmacKey: string }) {
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
        const origin =
            process.env.NODE_ENV === "production" ? "https://tickets.seiseisai.com" : "http://localhost:3002";
        const hmac = crypto.createHmac("sha256", hmacKey);
        let id: string | null = null;
        let counter = 0;
        const generator = () => {
            ++counter;
            if (counter % 3 === 1) {
                id =
                    process.env.NODE_ENV === "production"
                        ? crypto.randomUUID()
                        : crypto.randomBytes(16).toString("hex");
            }
            if (!id) return;
            const now = new Date();
            const signature = hmac.update(id + "_" + now.getTime().toString()).digest("hex");
            const url = `${origin}/authorize?id=${id}&ts=${now.getTime()}&sig=${signature}`;
            setUrl(url);
        };
        generator();
        const interval = setInterval(generator, 1319);
        return () => clearInterval(interval);
    }, [hmacKey]);
    if (!url)
        return (
            <div className={cn("size-full text-center text-2xl", className)}>
                <div className={styles.spinner}>
                    <div className={styles.cube1}></div>
                    <div className={styles.cube2}></div>
                </div>
            </div>
        );
    return <QRCodeSVG value={url} size={256} bgColor="#ffffff" fgColor="#000000" level="H" className={className} />;
}
