import crypto from "crypto";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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
                        throw new Error();
                    }
                    return user;
                } catch {
                    throw new Error();
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET,
    logger: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error(error) {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        warn(code) {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        debug(message, metadata) {},
    },
});
