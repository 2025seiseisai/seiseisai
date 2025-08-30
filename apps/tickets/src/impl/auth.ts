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
    signOut,
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

                    const now = dayjs().tz("Asia/Tokyo");
                    // 3分以上前または未来のタイムスタンプは無効
                    const ts = dayjs(timestamp).tz("Asia/Tokyo");
                    if (ts.isBefore(now.subtract(3, "minute")) || ts.isAfter(now.add(3, "minute"))) {
                        return null;
                    }

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

                    const secretKey = process.env.TURNSTILE_SECRET_KEY_LOGIN;
                    if (!secretKey) {
                        return null;
                    }
                    const verifyRes = await verifyTurnstileToken(turnstileToken, secretKey);
                    if (!verifyRes) {
                        return null;
                    }

                    // TODO: ユーザーをデータベースに追加

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
        async jwt({ token, user, account }) {
            if (user) {
                token = {
                    ...token,
                    userId: user.userId,
                };
            }
            if (user && account?.provider === "credentials") {
                const now = dayjs().tz("Asia/Tokyo");
                let expiresAt = now.hour(18).minute(0).second(0).millisecond(0);
                if (expiresAt.isBefore(now)) {
                    expiresAt = expiresAt.add(1, "day");
                }
                token.exp = Math.floor(expiresAt.unix());
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
            if (token.exp) {
                session.expires = new Date(token.exp * 1000);
            }
            return session;
        },
    },
    logger: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error(error) {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        warn(code) {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        debug(message, metadata) {},
    },
});

export { handlers, signIn, signOut };

export const auth = cache(async () => {
    const session = await authInternal();
    if (!session) return null;
    if (!session.user || typeof session.user.userId !== "string") {
        await signOut({ redirect: false });
        return null;
    }
    const now = dayjs();
    const expires = dayjs(session.expires);
    if (now.isAfter(expires)) {
        await signOut({ redirect: false });
        return null;
    }
    return session.user.userId;
});

/*
export async function SessionProvider({ children }: { children: React.ReactNode }) {
    const session = await auth();
    return <AuthProvider session={session}>{children}</AuthProvider>;
}
*/
