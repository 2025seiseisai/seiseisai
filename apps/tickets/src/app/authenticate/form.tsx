"use client";
import TurnstileWidget from "@seiseisai/turnstile/client";
import { Alert, AlertDescription, AlertTitle } from "@seiseisai/ui/components/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@seiseisai/ui/components/card";
import { cn } from "@seiseisai/ui/lib/utils";
import { AlertCircleIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./spinner.module.scss";

export default function AuthenticationForm({ id, ts, sig }: { id: string; ts: string; sig: string }) {
    const [failed, setFailed] = useState(false);

    const router = useRouter();
    async function signInEvent(token: string) {
        const result = await signIn("credentials", {
            id: id,
            timestamp: ts,
            signature: sig,
            turnstileToken: token,
            redirect: false,
        });
        if (!result || result.error || !result.ok) {
            setFailed(true);
        } else {
            router.push("/");
        }
    }
    return (
        <>
            <div className="mx-auto flex w-[calc(100%-40px)] flex-1 items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="mt-3 flex items-center justify-center">
                        <div className={styles.loader} />
                        <CardTitle className="mb-1 text-2xl font-semibold sm:text-3xl">認証中...</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className={cn("max-w-full overflow-x-auto", failed ? "mb-2" : "mb-1")}>
                            <TurnstileWidget
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_TICKETS!}
                                onVerify={(token) => signInEvent(token)}
                                onError={() => setFailed(true)}
                                theme="light"
                            />
                        </div>
                        {failed && (
                            <Alert variant="destructive" className="mt-3 mb-1 w-full">
                                <AlertCircleIcon />
                                <AlertTitle>認証に失敗しました</AlertTitle>
                                <AlertDescription>
                                    お手数をおかけしますが、もう一度QRコードを読み込んでください。
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
