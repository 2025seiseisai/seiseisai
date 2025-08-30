import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            userId: string;
        };
        expires: Date | string;
    }
    interface User {
        userId: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId: string;
    }
}
