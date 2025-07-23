"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { login } from "@/impl/auth-actions";
import { signInSchema } from "@/impl/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const dynamic = "force-dynamic";

export default function Page() {
    const [submitting, setSubmitting] = useState(false);
    const form = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const message = error
        ? error === "1"
            ? "管理者名またはパスワードが間違っています。"
            : "もう一度お試しください。"
        : null;
    async function onSubmit(data: z.infer<typeof signInSchema>) {
        setSubmitting(true);
        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("password", data.password);
        const { returncode } = await login(formData);
        if (returncode === 0) {
            router.push("/");
        } else {
            // eslint-disable-next-line react-compiler/react-compiler
            window.location.href = `/login?error=${returncode}`;
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-1 items-center justify-center">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>ログイン</CardTitle>
                        <CardDescription>管理者名とパスワードを入力してください</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <FormField
                                control={form.control}
                                name="username"
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
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        {message && (
                            <Alert variant="destructive">
                                <AlertCircleIcon />
                                <AlertTitle>ログインに失敗しました</AlertTitle>
                                <AlertDescription>{message}</AlertDescription>
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
