import crypto from "crypto";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cache } from "react";
import { z } from "zod";
import { AuthProvider } from "./auth-client";
import { getAdminById, getAdminByName, getAdminPassword } from "./database";

const signInSchema = z.object({
    name: z.string().min(1).max(256),
    password: z.string().min(1).max(256),
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
                name: { label: "Name", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const { name, password } = await signInSchema.parseAsync(credentials);
                    const user = await getAdminByName(name);
                    if (!user) {
                        return null;
                    }
                    const expected = await getAdminPassword(user.id);
                    if (
                        !expected ||
                        expected.hashedPassword !==
                            crypto
                                .createHash("sha256")
                                .update(password + process.env.HASH_SALT)
                                .digest("hex")
                    ) {
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
