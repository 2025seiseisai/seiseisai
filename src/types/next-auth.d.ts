import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            adminId: string;
        };
    }
    interface User {
        adminId: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        adminId: string;
    }
}
