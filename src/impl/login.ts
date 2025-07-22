"use server";
import { signIn } from "@/impl/auth";

export async function login(formData: FormData) {
    try {
        await signIn("credentials", formData);
        return { returncode: 0 };
    } catch (err) {
        if (err instanceof Error) {
            return { returncode: 1 };
        }
        return { returncode: 2 };
    }
}
