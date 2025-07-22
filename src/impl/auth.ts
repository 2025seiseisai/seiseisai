import crypto from "crypto";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ZodError } from "zod";
import dbClient from "./database";
import { signInSchema } from "./zod";

export const { signIn, signOut, auth, handlers } = NextAuth({
    providers: [
        CredentialsProvider({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const { username, password } = await signInSchema.parseAsync(credentials);
                    const user = await dbClient.admin.findUnique({
                        where: {
                            name: username,
                        },
                    });
                    if (
                        !user ||
                        user.hashedPassword !==
                            crypto
                                .createHash("sha256")
                                .update(password + process.env.HASH_SALT)
                                .digest("hex")
                    ) {
                        return null;
                    }
                    return user;
                } catch (error) {
                    if (error instanceof ZodError) {
                        return null;
                    }
                    throw error;
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET,
});
