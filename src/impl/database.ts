import { PrismaClient } from "@/generated/prisma/client";
import { AdminModel, NewsModel } from "@/generated/prisma/models";
import { UpdateResult } from "@/impl/update-result";
import crypto from "crypto";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const dbClient = globalForPrisma.prisma || new PrismaClient();
if (!globalForPrisma.prisma) {
    if (process.env.SUPERADMIN_HASHED_PASSWORD === undefined) {
        console.error("SUPERADMIN_HASHED_PASSWORD is not set in the environment variables.");
    }

    await dbClient.admin.deleteMany({
        where: {
            id: "superadmin",
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
    await dbClient.adminPassword.deleteMany({
        where: {
            adminId: "superadmin",
        },
    });
    await dbClient.adminPassword.create({
        data: {
            adminId: "superadmin",
            hashedPassword: process.env.SUPERADMIN_HASHED_PASSWORD || "",
        },
    });
}
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = dbClient;

export async function getAdminByName(name: string) {
    return await dbClient.admin.findUnique({
        where: {
            name,
        },
    });
}

export async function getAdminPassword(id: string) {
    return await dbClient.adminPassword.findUnique({
        where: {
            adminId: id,
        },
    });
}

export async function getAdminById(id: string) {
    return await dbClient.admin.findUnique({
        where: {
            id,
        },
    });
}

export async function getAllAdmins() {
    return await dbClient.admin.findMany({
        orderBy: {
            name: "asc",
        },
    });
}

export async function createAdmin(admin: AdminModel, password: string) {
    if (admin.id === "superadmin" || password.length < 8) return null;
    const count = await dbClient.admin.count({
        where: {
            id: admin.id,
        },
    });
    if (count > 0) return null;
    const hashedPassword = crypto
        .createHash("sha256")
        .update(password + process.env.HASH_SALT)
        .digest("hex");
    await dbClient.admin.create({
        data: admin,
    });
    await dbClient.adminPassword.create({
        data: {
            adminId: admin.id,
            hashedPassword,
        },
    });
}

export async function deleteAdmin(id: string) {
    if (id === "superadmin") return null;
    return await dbClient.admin.delete({
        where: {
            id,
        },
    });
}

export async function updateAdminPassword(id: string, new_password: string) {
    if (id === "superadmin" || new_password.length < 8) return null;
    const hashedPassword = crypto
        .createHash("sha256")
        .update(new_password + process.env.HASH_SALT)
        .digest("hex");
    const result = await dbClient.adminPassword.updateMany({
        where: {
            adminId: id,
        },
        data: {
            hashedPassword,
        },
    });
    return result.count > 0 ? true : null;
}

export async function updateAdminSafe(prev_data: AdminModel, new_data: AdminModel) {
    if (prev_data.id !== new_data.id) return UpdateResult.Invalid;
    const id = prev_data.id;
    if (id === "superadmin") return UpdateResult.Invalid;
    const current = await dbClient.admin.findUnique({
        where: {
            id,
        },
    });
    if (!current) return UpdateResult.NotFound;
    const assign: Partial<AdminModel> = {};
    if (prev_data.name !== new_data.name) {
        if (current.name !== prev_data.name) return UpdateResult.Overwrite;
        else assign.name = new_data.name;
    }
    const keys = Object.keys(new_data) as (keyof AdminModel)[];
    for (const key of keys) {
        if (key === "id" || key === "name") {
            continue;
        }
        if (prev_data[key] !== new_data[key]) {
            if (current[key] !== prev_data[key]) {
                return UpdateResult.Overwrite;
            }
            assign[key] = new_data[key];
        }
    }
    if (Object.keys(assign).length === 0) return UpdateResult.NoChange;
    await dbClient.admin.update({
        where: {
            id,
        },
        data: assign,
    });
    return UpdateResult.Success;
}

export async function updateAdminUnsafe(new_data: AdminModel) {
    if (new_data.id === "superadmin") return null;
    const result = await dbClient.admin.updateMany({
        where: {
            id: new_data.id,
        },
        data: new_data,
    });
    return result.count > 0 ? true : null;
}

export async function getAllNews() {
    return await dbClient.news.findMany({
        orderBy: {
            date: "desc",
        },
    });
}

export async function deleteNews(id: string) {
    return await dbClient.news.delete({
        where: {
            id,
        },
    });
}

export async function updateNewsSafe(prev_data: NewsModel, new_data: NewsModel) {
    if (prev_data.id !== new_data.id) return UpdateResult.Invalid;
    const id = prev_data.id;
    const current = await dbClient.news.findUnique({
        where: {
            id,
        },
    });
    if (!current) return UpdateResult.NotFound;
    const assign: Partial<NewsModel> = {};
    if (prev_data.title !== new_data.title) {
        if (current.title !== prev_data.title) return UpdateResult.Overwrite;
        else assign.title = new_data.title;
    }
    if (prev_data.content !== new_data.content) {
        if (current.content !== prev_data.content) return UpdateResult.Overwrite;
        else assign.content = new_data.content;
    }
    if (prev_data.date.getTime() !== new_data.date.getTime()) {
        if (current.date.getTime() !== prev_data.date.getTime()) return UpdateResult.Overwrite;
        else assign.date = new_data.date;
    }
    if (prev_data.importance !== new_data.importance) {
        if (current.importance !== prev_data.importance) return UpdateResult.Overwrite;
        else assign.importance = new_data.importance;
    }
    if (Object.keys(assign).length === 0) return UpdateResult.NoChange;
    await dbClient.news.update({
        where: {
            id,
        },
        data: assign,
    });
    return UpdateResult.Success;
}

export async function updateNewsUnsafe(new_data: NewsModel) {
    const result = await dbClient.news.updateMany({
        where: {
            id: new_data.id,
        },
        data: new_data,
    });
    return result.count > 0 ? true : null;
}

export async function createNews(news: NewsModel) {
    const count = await dbClient.news.count({
        where: {
            id: news.id,
        },
    });
    if (count > 0) return null;
    return await dbClient.news.create({
        data: news,
    });
}
