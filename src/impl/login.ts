"use server";
import { signIn } from "@/impl/auth";
import { AuthError } from "next-auth";

export async function login(formData: FormData) {
    try {
        await signIn("credentials", formData);
        return { success: true, message: "ログインに成功しました。" };
    } catch (err) {
        if (err instanceof AuthError) {
            return {
                success: false,
                message: err.message,
            };
        }
        return { success: false, message: "ログインに失敗しました。もう一度お試しください。" };
    }
}
