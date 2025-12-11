import { EventTicketType, GoodsStock } from "@seiseisai/database/enums";
import * as z from "zod";

export const adminIdSchema = z.string().min(16, "IDは16文字以上でなければなりません。").max(256);
export const passwordSchema = z.string().min(8, "パスワードは8文字以上でなければなりません。").max(256);

export const adminSchema = z.object({
    id: adminIdSchema.or(z.literal("superadmin")),
    name: z.string().min(1, "管理者名は必須です。").max(256, "管理者名が長すぎます。"),
    authorityAdmins: z.boolean(),
    authorityNews: z.boolean(),
    authorityGoods: z.boolean(),
    authorityGoodsStock: z.boolean(),
    authorityTickets: z.boolean(),
    authorityUserAuthentication: z.boolean(),
    authorityTicketVerification: z.boolean(),
});

export const adminFormSchema = adminSchema.extend({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
});

export const newsIdSchema = z
    .string()
    .min(16, "IDは16文字以上でなければなりません。")
    .max(64, "IDは64文字以下でなければなりません。");
export const newsSchema = z.object({
    id: newsIdSchema,
    title: z.string().min(1, "タイトルは必須です。").max(256, "タイトルが長すぎます。"),
    date: z
        .date()
        .refine(
            (date) =>
                date.getHours() === 0 &&
                date.getMinutes() === 0 &&
                date.getSeconds() === 0 &&
                date.getMilliseconds() === 0,
            {
                message: "時刻は指定できません。日付のみを指定してください。",
            },
        ),
    importance: z.boolean(),
    content: z.string().min(1, "内容は必須です。").max(65536, "内容が長すぎます。"),
});

export const goodsIdSchema = z.string().min(16, "IDは16文字以上でなければなりません。").max(256, "IDが長すぎます。");
export const goodsSchema = z.object({
    id: goodsIdSchema,
    name: z.string().min(1, "名前は必須です。").max(256, "名前が長すぎます。"),
    stock: z.enum([GoodsStock.売り切れ, GoodsStock.残りわずか, GoodsStock.在庫少なめ, GoodsStock.在庫あり]),
});

export const ticketInfoIdSchema = z
    .string()
    .min(16, "IDは16文字以上でなければなりません。")
    .max(64, "IDは64文字以下でなければなりません。");
export const ticketInfoSchema = z
    .object({
        id: ticketInfoIdSchema,
        name: z.string().min(1, "イベント名は必須です。").max(256, "イベント名が長すぎます。"),
        link: z
            .string()
            .max(2048, "リンクが長すぎます。")
            .startsWith("https://", "リンクは https:// から始まる必要があります。")
            .or(z.literal("")),
        applicationStart: z.date(),
        applicationEnd: z.date(),
        eventStart: z.date(),
        eventEnd: z.date(),
        capacity: z.number().int().min(1, "定員は1以上です。").max(10000, "定員が大きすぎます。"),
        paperTicketsPerUser: z
            .number()
            .int()
            .min(1, "最大応募枚数は1以上です。")
            .max(10, "最大応募枚数が大きすぎます。"),
        type: z.enum([EventTicketType.個人制, EventTicketType.参加者制, EventTicketType.グループ制]),
    })
    .superRefine((data, ctx) => {
        const checkDate = (d: Date, path: string, name: string) => {
            if (d.getSeconds() !== 0 || d.getMilliseconds() !== 0) {
                ctx.addIssue({
                    path: [path],
                    code: "custom",
                    message: `${name}日時の秒以下は0にしてください。`,
                });
            }
        };
        const checkDateOrder = (d1: Date, d2: Date, path: string, name1: string, name2: string) => {
            if (d1 >= d2) {
                ctx.addIssue({
                    path: [path],
                    code: "custom",
                    message: `${name2}日時は${name1}日時より後でなければなりません。`,
                });
            }
        };
        checkDate(data.applicationStart, "applicationStart", "応募開始");
        checkDate(data.applicationEnd, "applicationEnd", "応募終了");
        checkDate(data.eventStart, "eventStart", "イベント開始");
        checkDate(data.eventEnd, "eventEnd", "イベント終了");
        checkDateOrder(data.applicationStart, data.applicationEnd, "applicationEnd", "応募開始", "応募終了");
        checkDateOrder(data.applicationEnd, data.eventStart, "eventStart", "応募終了", "イベント開始");
        checkDateOrder(data.eventStart, data.eventEnd, "eventEnd", "イベント開始", "イベント終了");
    });

export const ticketIdSchema = z.string().min(16).max(128);
export const signatureSchema = z.string().regex(/^[0-9a-f]{64}$/i);
