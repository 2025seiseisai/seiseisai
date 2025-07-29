import { PrismaClient } from "@/generated/prisma/client";
import { NewsModel } from "@/generated/prisma/models";
import { ChangeNewsSafeResult } from "@/impl/enums";
export * from "@/generated/prisma/models";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const dbClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = dbClient;
export default dbClient;

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

export async function deleteAdmin(id: string) {
    if (id === "superadmin") return null;
    return await dbClient.admin.delete({
        where: {
            id,
        },
    });
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
    if (prev_data.id !== new_data.id) return ChangeNewsSafeResult.Invalid;
    const id = prev_data.id;
    const current = await dbClient.news.findUnique({
        where: {
            id,
        },
    });
    if (!current) return ChangeNewsSafeResult.NotFound;
    const assign: Partial<NewsModel> = {};
    if (prev_data.title !== new_data.title) {
        if (current.title !== prev_data.title) return ChangeNewsSafeResult.Overwrite;
        else assign.title = new_data.title;
    }
    if (prev_data.content !== new_data.content) {
        if (current.content !== prev_data.content) return ChangeNewsSafeResult.Overwrite;
        else assign.content = new_data.content;
    }
    if (prev_data.date.getTime() !== new_data.date.getTime()) {
        if (current.date.getTime() !== prev_data.date.getTime()) return ChangeNewsSafeResult.Overwrite;
        else assign.date = new_data.date;
    }
    if (prev_data.importance !== new_data.importance) {
        if (current.importance !== prev_data.importance) return ChangeNewsSafeResult.Overwrite;
        else assign.importance = new_data.importance;
    }
    if (Object.keys(assign).length === 0) return ChangeNewsSafeResult.NoChange;
    await dbClient.news.update({
        where: {
            id,
        },
        data: assign,
    });
    return ChangeNewsSafeResult.Success;
}

export async function updateNewsUnsafe(new_data: NewsModel) {
    const count = await dbClient.news.count({
        where: {
            id: new_data.id,
        },
    });
    if (count === 0) return null;
    return await dbClient.news.update({
        where: {
            id: new_data.id,
        },
        data: new_data,
    });
}

export async function createNews(news: NewsModel) {
    if (news.id.length < 8) return null;
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
