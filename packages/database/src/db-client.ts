import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

function createPrismaClient() {
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL,
    });
    return new PrismaClient({ adapter });
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const dbClient = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = dbClient;
