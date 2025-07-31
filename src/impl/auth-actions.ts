"use server";
import { signIn } from "@/impl/auth";
import { redirect } from "next/navigation";

export async function login(name: string, password: string, turnstileToken: string) {
    const secretKey = process.env.TURNSTILE_SECRET_KEY!;
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            secret: secretKey,
            response: turnstileToken,
        }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
        redirect(`/login?error=3`);
    }
    try {
        await signIn("credentials", {
            name: name,
            password: password,
            redirect: false,
        });
    } catch (err) {
        if (err instanceof Error) {
            redirect(`/login?error=1`);
        }
        redirect(`/login?error=2`);
    }
    redirect("/");
}
