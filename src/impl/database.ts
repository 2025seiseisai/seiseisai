import { PrismaClient } from "@/generated/prisma/client";
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
