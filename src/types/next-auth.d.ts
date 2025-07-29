import type { AdminModel } from "./database";

declare module "next-auth" {
    interface Session {
        user: AdminModel;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AdminModel {}
}

declare module "next-auth/jwt" {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface JWT extends AdminModel {}
}
