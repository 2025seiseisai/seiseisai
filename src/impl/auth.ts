import crypto from "crypto";
import NextAuth, { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { AdminModel, getAdminById, getAdminByName, getAdminPassword } from "./database";
import { signInSchema } from "./zod";

export const { signIn, signOut, auth, handlers } = NextAuth({
    providers: [
        CredentialsProvider({
            credentials: {
                name: { label: "Name", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials): Promise<AdminModel | null> {
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
                    return user;
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
        async jwt({ token, user }): Promise<JWT> {
            if (user) {
                token = {
                    ...token,
                    ...user,
                };
            }
            return token;
        },
        async session({ session, token }): Promise<Session> {
            if (token) {
                session.user = {
                    ...session.user,
                    ...token,
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

export async function getAuthSession() {
    const session = await auth();
    if (!session || !session.user || typeof session.user.id !== "string") return null;
    const admin = await getAdminById(session.user.id);
    if (!admin) return null;
    return admin;
}
