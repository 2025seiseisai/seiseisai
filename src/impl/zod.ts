import { boolean, date, object, string } from "zod";

export const signInSchema = object({
    username: string().min(1, "この項目は必須です。").max(256, "ユーザー名が長すぎます。"),
    password: string().min(1, "この項目は必須です。").max(256, "パスワードが長すぎます。"),
});

export const newsSchema = object({
    id: string()
        .min(1, "IDは必須です。")
        .min(8, "IDは8文字以上でなければなりません。")
        .max(64, "IDは64文字以下でなければなりません。"),
    title: string().min(1, "タイトルは必須です。").max(256, "タイトルが長すぎます。"),
    content: string().min(1, "内容は必須です。").max(65536, "内容が長すぎます。"),
    importance: boolean(),
    date: date(),
});
