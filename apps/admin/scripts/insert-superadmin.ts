import { dbClient } from "@seiseisai/database/db-client";
import assert from "assert";

assert(process.env.DATABASE_URL, "DATABASE_URL is not set");
assert(process.env.DIRECT_URL, "DIRECT_URL is not set");
assert(process.env.SUPERADMIN_HASHED_PASSWORD, "SUPERADMIN_HASHED_PASSWORD is not set");

await dbClient.admin.deleteMany({
    where: {
        id: "superadmin",
    },
});
await dbClient.adminPassword.deleteMany({
    where: {
        adminId: "superadmin",
    },
});

const created = await dbClient.admin.create({
    data: {
        id: "superadmin",
        name: "システム管理者",
    },
});
const new_value = Object.fromEntries(
    Object.keys(created).map((key) => {
        if (key === "id" || key === "name") return [key, created[key]];
        return [key, true];
    }),
);
await dbClient.admin.update({
    where: {
        id: "superadmin",
    },
    data: new_value,
});
await dbClient.adminPassword.create({
    data: {
        adminId: "superadmin",
        hashedPassword: process.env.SUPERADMIN_HASHED_PASSWORD || "",
    },
});
