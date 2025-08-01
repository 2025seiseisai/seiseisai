import { PrismaClient } from "@/generated/prisma/client";

const dbClient = new PrismaClient();

if (process.env.SUPERADMIN_HASHED_PASSWORD === undefined) {
    throw new Error("SUPERADMIN_HASHED_PASSWORD is not set.");
}

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
