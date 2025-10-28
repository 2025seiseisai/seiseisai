"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import TurnstileWidget from "@seiseisai/turnstile/client";
import { Alert, AlertDescription, AlertTitle } from "@seiseisai/ui/components/alert";
import { Button } from "@seiseisai/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@seiseisai/ui/components/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@seiseisai/ui/components/form";
import { Input } from "@seiseisai/ui/components/input";
import { AlertCircleIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signInSchema = z.object({
    name: z.string().min(1, "この項目は必須です。").max(256, "ユーザー名が長すぎます。"),
    password: z.string().min(1, "この項目は必須です。").max(256, "パスワードが長すぎます。"),
});

export const dynamic = "force-dynamic";

export default function LogInForm() {
    "use no memo";
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_ADMIN;
    if (!siteKey) {
        throw new Error("NEXT_PUBLIC_TURNSTILE_SITE_KEY_ADMIN is not set");
    }
    const [submitting, setSubmitting] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const form = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            name: "",
            password: "",
        },
    });
    const searchParams = useSearchParams();
    const failed = searchParams.get("error") !== null;
    async function onSubmit(data: z.infer<typeof signInSchema>) {
        if (!turnstileToken) {
            window.location.href = "/login?error";
            return;
        }
        setSubmitting(true);
        const result = await signIn("credentials", {
            name: data.name,
            password: data.password,
            turnstileToken: turnstileToken,
            redirect: false,
        });
        const error = result.error;
        window.location.href = error ? `/login?error` : "/";
    }
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mx-auto flex w-[calc(100%-40px)] flex-1 items-center justify-center"
            >
                <Card className="w-full max-w-sm gap-3">
                    <CardHeader className="mb-3">
                        <CardTitle>ログイン</CardTitle>
                        <CardDescription>管理者名とパスワードを入力してください</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>管理者名</FormLabel>
                                        <FormControl>
                                            <Input {...field} autoComplete="off" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>パスワード</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <TurnstileWidget
                            siteKey={siteKey}
                            onVerify={(token) => setTurnstileToken(token)}
                            theme="light"
                            className="mt-4 mb-0 overflow-x-auto"
                        />
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        {failed && (
                            <Alert variant="destructive">
                                <AlertCircleIcon />
                                <AlertTitle>ログインに失敗しました</AlertTitle>
                                <AlertDescription>管理者名またはパスワードを確認してください。</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" className="w-full" disabled={submitting}>
                            ログイン
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
