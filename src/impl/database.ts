import { PrismaClient } from "@/generated/prisma/client";
import { NewsModel } from "@/generated/prisma/models";
import { ChangeNewsSafeResult } from "@/impl/enums";
export * from "@/generated/prisma/models";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const dbClient = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = dbClient;
export default dbClient;

export async function getAdminByName(name: string) {
    return await dbClient.admin.findUnique({
        where: {
            name,
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

export async function changeNewsSafe(prev_data: NewsModel, new_data: NewsModel) {
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

export async function changeNewsUnsafe(new_data: NewsModel) {
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

export async function addNews(news: NewsModel) {
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
