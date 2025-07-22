import { object, string } from "zod";

export const signInSchema = object({
    username: string().min(1, "この項目は必須です。").max(256, "ユーザー名が長すぎます。"),
    password: string().min(1, "この項目は必須です。").max(256, "パスワードが長すぎます。"),
});
