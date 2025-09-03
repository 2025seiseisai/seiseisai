import { createTicketUser, getTicketUserById } from "@seiseisai/database";
import dayjs from "@seiseisai/date";
import verifyTurnstileToken from "@seiseisai/turnstile/server";
import crypto from "crypto";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cache } from "react";
import { z } from "zod";

const signInSchema = z.object({
    id: z.string().min(1).max(256),
    timestamp: z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !Number.isNaN(val) && Number.isSafeInteger(val) && val > 0),
    signature: z.string().min(1).max(1024),
    turnstileToken: z.string().min(1).max(4096),
});

const {
    signIn,
    auth: authInternal,
    handlers,
} = NextAuth({
    providers: [
        CredentialsProvider({
            credentials: {
                id: { label: "ID", type: "text" },
                timestamp: { label: "Timestamp", type: "hidden" },
                signature: { label: "Signature", type: "hidden" },
                turnstileToken: { label: "Turnstile Token", type: "hidden" },
            },
            async authorize(credentials) {
                try {
                    const parsed = await signInSchema.safeParseAsync(credentials);
                    if (!parsed.success) {
                        return null;
                    }

                    const { id, timestamp, signature, turnstileToken } = parsed.data;

                    // 1分以上前または未来のタイムスタンプは無効
                    const now = dayjs().tz("Asia/Tokyo");
                    const ts = dayjs(timestamp).tz("Asia/Tokyo");
                    if (now.isAfter(ts.add(1, "minute")) || now.isBefore(ts)) {
                        return null;
                    }

                    // 署名の検証
                    const hmacKey = process.env.TICKET_HMAC_KEY_LOGIN;
                    if (!hmacKey) {
                        return null;
                    }
                    const expectedSignature = crypto
                        .createHmac("sha256", hmacKey)
                        .update(id + "_" + timestamp.toString())
                        .digest("hex");
                    if (signature !== expectedSignature) {
                        return null;
                    }

                    // Cloudflare Turnstileの検証
                    const secretKey = process.env.TURNSTILE_SECRET_KEY_TICKETS;
                    if (!secretKey) {
                        return null;
                    }
                    const verifyRes = await verifyTurnstileToken(turnstileToken, secretKey);
                    if (!verifyRes) {
                        return null;
                    }

                    let expiresAt = now.hour(18).minute(0).second(0).millisecond(0);
                    if (expiresAt.isBefore(now)) {
                        expiresAt = expiresAt.add(1, "day");
                    }
                    // ここでエラーが起きた場合は例外が送出され拒否される
                    await createTicketUser(id, expiresAt.toDate());

                    return {
                        userId: id,
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],
    secret: process.env.AUTH_SECRET_TICKETS,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            const id = user ? user.userId : token.userId || null;
            if (id) {
                try {
                    const userInfo = await getTicketUserById(id);
                    if (!userInfo) return null;
                    const now = dayjs();
                    const expiresAt = dayjs(userInfo.expiresAt);
                    if (now.isAfter(expiresAt)) return null;
                    token.userId = id;
                    token.exp = Math.floor(userInfo.expiresAt.getTime() / 1000);
                } catch {
                    return null;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    userId: token.userId,
                };
            }
            return session;
        },
    },
    cookies:
        process.env.NODE_ENV === "production"
            ? undefined
            : {
                  sessionToken: { name: `seiseisai-tickets.session-token` },
                  callbackUrl: { name: `seiseisai-tickets.callback-url` },
                  csrfToken: { name: `seiseisai-tickets.csrf-token` },
              },
});

export { handlers, signIn };

export const auth = cache(async () => {
    try {
        const session = await authInternal();
        if (!session) return null;
        if (!session.user || typeof session.user.userId !== "string") return null;
        return session.user.userId;
    } catch {
        // 念のため
        return null;
    }
});
