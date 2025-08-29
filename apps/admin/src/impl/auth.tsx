import { getAdminById, getAdminByName, getAdminPassword } from "@seiseisai/database";
import verifyTurnstileToken from "@seiseisai/turnstile/server";
import crypto from "crypto";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cache } from "react";
import { z } from "zod";
import { AuthProvider } from "./auth-client";

const signInSchema = z.object({
    name: z.string().min(1).max(256),
    password: z.string().min(1).max(256),
    turnstileToken: z.string().min(1).max(4096),
});

export function getHashedPassword(password: string) {
    return crypto
        .createHash("sha256")
        .update(password + process.env.HASH_SALT)
        .digest("hex");
}

const {
    signIn,
    signOut,
    auth: authInternal,
    handlers,
} = NextAuth({
    providers: [
        CredentialsProvider({
            credentials: {
                name: { label: "Name", type: "text" },
                password: { label: "Password", type: "password" },
                turnstileToken: { label: "Turnstile Token", type: "hidden" },
            },
            async authorize(credentials) {
                try {
                    const parsed = await signInSchema.safeParseAsync(credentials);
                    if (!parsed.success) {
                        return null;
                    }

                    const { name, password, turnstileToken } = parsed.data;

                    const secretKey = process.env.TURNSTILE_SECRET_KEY!;
                    const verifyRes = await verifyTurnstileToken(turnstileToken, secretKey);
                    if (!verifyRes) {
                        return null;
                    }

                    const user = await getAdminByName(name);
                    if (!user) {
                        return null;
                    }
                    const expected = await getAdminPassword(user.id);
                    if (!expected || expected.hashedPassword !== getHashedPassword(password)) {
                        return null;
                    }
                    return {
                        adminId: user.id,
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 12 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token = {
                    ...token,
                    adminId: user.adminId,
                };
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    adminId: token.adminId,
                };
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
    if (!session.user || typeof session.user.adminId !== "string") {
        await signOut({ redirect: false });
        return null;
    }
    const admin = await getAdminById(session.user.adminId);
    if (!admin) {
        await signOut({ redirect: false });
        return null;
    }
    return admin;
});

export async function SessionProvider({ children }: { children: React.ReactNode }) {
    const session = await auth();
    return <AuthProvider session={session}>{children}</AuthProvider>;
}
