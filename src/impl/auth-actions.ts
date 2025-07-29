"use server";
import { signIn } from "@/impl/auth";
import { redirect } from "next/navigation";

export async function login(name: string, password: string) {
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
