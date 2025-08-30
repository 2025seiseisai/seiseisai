import dayjs from "@seiseisai/date";
import { dbClient } from "./db-client";
import { UpdateResult } from "./enums";
import { AdminModel, EventTicketInfoModel, GoodsModel, NewsModel } from "./models";

/* =========================
 * Admin
 * ========================= */

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

export async function createAdmin(admin: AdminModel, password: string, passwordHash: (password: string) => string) {
    if (admin.id === "superadmin" || password.length < 8) return null;
    return await dbClient.$transaction(
        async (tx) => {
            const count1 = await tx.admin.count({ where: { id: admin.id } });
            if (count1 > 0) return null;
            const count2 = await tx.admin.count({ where: { name: admin.name } });
            if (count2 > 0) return null;
            await tx.admin.create({ data: admin });
            await tx.adminPassword.create({
                data: {
                    adminId: admin.id,
                    hashedPassword: passwordHash(password),
                },
            });
            return true;
        },
        { isolationLevel: "Serializable" },
    );
}

export async function deleteAdmin(id: string) {
    if (id === "superadmin") return null;
    return await dbClient.admin.delete({
        where: {
            id,
        },
    });
}

export async function updateAdminPassword(
    id: string,
    new_password: string,
    passwordHash: (password: string) => string,
) {
    if (id === "superadmin" || new_password.length < 8) return null;
    const result = await dbClient.adminPassword.updateMany({
        where: {
            adminId: id,
        },
        data: {
            hashedPassword: passwordHash(new_password),
        },
    });
    return result.count > 0 ? true : null;
}

export async function updateAdminSafe(prev_data: AdminModel, new_data: AdminModel) {
    if (prev_data.id !== new_data.id) return UpdateResult.Invalid;
    if (prev_data.id === "superadmin") return UpdateResult.Invalid;
    return await dbClient.$transaction(
        async (tx) => {
            const id = prev_data.id;
            const current = await tx.admin.findUnique({ where: { id } });
            if (!current) return UpdateResult.NotFound;
            const nameExists = await tx.admin.count({
                where: { name: new_data.name, id: { not: id } },
            });
            if (nameExists > 0) return UpdateResult.NameExists;
            const assign: Partial<AdminModel> = {};
            if (prev_data.name !== new_data.name) {
                if (current.name !== prev_data.name) return UpdateResult.Overwrite;
                assign.name = new_data.name;
            }
            const keys = Object.keys(new_data) as (keyof AdminModel)[];
            for (const key of keys) {
                if (key === "id" || key === "name") continue;
                if (prev_data[key] !== new_data[key]) {
                    if (current[key] !== prev_data[key]) return UpdateResult.Overwrite;
                    assign[key] = new_data[key];
                }
            }
            if (Object.keys(assign).length === 0) return UpdateResult.NoChange;
            await tx.admin.update({ where: { id }, data: assign });
            return UpdateResult.Success;
        },
        { isolationLevel: "Serializable" },
    );
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

/* =========================
 * News
 * ========================= */

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
    return await dbClient.$transaction(
        async (tx) => {
            const id = prev_data.id;
            const current = await tx.news.findUnique({ where: { id } });
            if (!current) return UpdateResult.NotFound;
            const assign: Partial<NewsModel> = {};
            if (prev_data.title !== new_data.title) {
                if (current.title !== prev_data.title) return UpdateResult.Overwrite;
                assign.title = new_data.title;
            }
            if (prev_data.content !== new_data.content) {
                if (current.content !== prev_data.content) return UpdateResult.Overwrite;
                assign.content = new_data.content;
            }
            if (prev_data.date.getTime() !== new_data.date.getTime()) {
                if (current.date.getTime() !== prev_data.date.getTime()) return UpdateResult.Overwrite;
                assign.date = new_data.date;
            }
            if (prev_data.importance !== new_data.importance) {
                if (current.importance !== prev_data.importance) return UpdateResult.Overwrite;
                assign.importance = new_data.importance;
            }
            if (Object.keys(assign).length === 0) return UpdateResult.NoChange;
            await tx.news.update({ where: { id }, data: assign });
            return UpdateResult.Success;
        },
        { isolationLevel: "Serializable" },
    );
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
    return await dbClient.$transaction(
        async (tx) => {
            const count = await tx.news.count({ where: { id: news.id } });
            if (count > 0) return null;
            return await tx.news.create({ data: news });
        },
        { isolationLevel: "Serializable" },
    );
}

/* =========================
 * Goods
 * ========================= */

export async function getAllGoods() {
    return await dbClient.goods.findMany({
        orderBy: {
            name: "asc",
        },
    });
}

export async function getGoodsByName(name: string) {
    return await dbClient.goods.findUnique({
        where: {
            name,
        },
    });
}

export async function createGoods(goods: GoodsModel) {
    return await dbClient.$transaction(
        async (tx) => {
            const count1 = await tx.goods.count({ where: { id: goods.id } });
            if (count1 > 0) return null;
            const count2 = await tx.goods.count({ where: { name: goods.name } });
            if (count2 > 0) return null;
            return await tx.goods.create({ data: goods });
        },
        { isolationLevel: "Serializable" },
    );
}

export async function deleteGoods(id: string) {
    return await dbClient.goods.delete({
        where: {
            id,
        },
    });
}

export async function updateGoodsSafe(prev_data: GoodsModel, new_data: GoodsModel, allow_name_change = false) {
    if (prev_data.id !== new_data.id) return UpdateResult.Invalid;
    if (!allow_name_change && prev_data.name !== new_data.name) return UpdateResult.Invalid;
    return await dbClient.$transaction(
        async (tx) => {
            const id = prev_data.id;
            const current = await tx.goods.findUnique({ where: { id } });
            if (!current) return UpdateResult.NotFound;
            if (!allow_name_change && current.name !== prev_data.name) return UpdateResult.Invalid;
            const nameExists = await tx.goods.count({
                where: { name: new_data.name, id: { not: id } },
            });
            if (nameExists > 0) return UpdateResult.NameExists;
            const assign: Partial<GoodsModel> = {};
            if (prev_data.name !== new_data.name) {
                if (current.name !== prev_data.name) return UpdateResult.Overwrite;
                assign.name = new_data.name;
            }
            if (prev_data.stock !== new_data.stock) {
                if (current.stock !== prev_data.stock) return UpdateResult.Overwrite;
                assign.stock = new_data.stock;
            }
            if (Object.keys(assign).length === 0) return UpdateResult.NoChange;
            await tx.goods.update({ where: { id }, data: assign });
            return UpdateResult.Success;
        },
        { isolationLevel: "Serializable" },
    );
}

export async function updateGoodsUnsafe(new_data: GoodsModel, allow_name_change = false) {
    if (allow_name_change) {
        const result = await dbClient.goods.updateMany({
            where: { id: new_data.id },
            data: new_data,
        });
        return result.count > 0 ? true : null;
    } else {
        return await dbClient.$transaction(
            async (tx) => {
                const current = await tx.goods.findUnique({ where: { id: new_data.id } });
                if (!current) return null;
                if (current.name !== new_data.name) return null;
                const result = await tx.goods.updateMany({
                    where: { id: new_data.id },
                    data: { stock: new_data.stock },
                });
                return result.count > 0 ? true : null;
            },
            { isolationLevel: "Serializable" },
        );
    }
}

/* =========================
 * EventTicketInfo
 * ========================= */

export async function getAllEventTicketInfo() {
    return await dbClient.eventTicketInfo.findMany({
        orderBy: {
            applicationStart: "asc",
        },
    });
}

export async function createEventTicketInfo(data: EventTicketInfoModel) {
    return await dbClient.$transaction(
        async (tx) => {
            const countId = await tx.eventTicketInfo.count({ where: { id: data.id } });
            if (countId > 0) return null;
            const countName = await tx.eventTicketInfo.count({ where: { name: data.name } });
            if (countName > 0) return null;
            await tx.eventTicketInfo.create({ data });
            return true;
        },
        { isolationLevel: "Serializable" },
    );
}

export async function deleteEventTicketInfo(id: string) {
    return await dbClient.eventTicketInfo.delete({
        where: {
            id,
        },
    });
}

export async function updateEventTicketInfoSafe(prev_data: EventTicketInfoModel, new_data: EventTicketInfoModel) {
    if (prev_data.id !== new_data.id) return UpdateResult.Invalid;
    return await dbClient.$transaction(
        async (tx) => {
            const id = prev_data.id;
            const currentRaw = await tx.eventTicketInfo.findUnique({ where: { id } });
            if (!currentRaw) return UpdateResult.NotFound;
            const current = currentRaw;
            if (prev_data.name !== new_data.name) {
                const nameExists = await tx.eventTicketInfo.count({
                    where: { name: new_data.name, id: { not: id } },
                });
                if (nameExists > 0) return UpdateResult.NameExists;
            }
            const assign: Partial<EventTicketInfoModel> = {};
            function check<K extends keyof EventTicketInfoModel>(k: K) {
                if (JSON.stringify(prev_data[k]) !== JSON.stringify(new_data[k])) {
                    if (JSON.stringify(current[k]) !== JSON.stringify(prev_data[k])) return UpdateResult.Overwrite;
                    assign[k] = new_data[k];
                }
                return null;
            }
            for (const key of [
                "name",
                "link",
                "applicationStart",
                "applicationEnd",
                "exchangeEnd",
                "capacity",
                "paperTicketsPerUser",
                "type",
            ] as (keyof EventTicketInfoModel)[]) {
                const r = check(key);
                if (r) return r;
            }
            if (Object.keys(assign).length === 0) return UpdateResult.NoChange;
            await tx.eventTicketInfo.update({ where: { id }, data: assign });
            return UpdateResult.Success;
        },
        { isolationLevel: "Serializable" },
    );
}

export async function updateEventTicketInfoUnsafe(new_data: EventTicketInfoModel) {
    const result = await dbClient.eventTicketInfo.updateMany({
        where: {
            id: new_data.id,
        },
        data: new_data,
    });
    return result.count > 0 ? true : null;
}

/* =========================
 * EventDrawResults
 * ========================= */

export async function getAllDrawResults() {
    return await dbClient.eventDrawResult.findMany();
}

export async function deleteExpiredTicketUsers() {
    return await dbClient.ticketUser.deleteMany({
        where: {
            expiresAt: {
                lt: dayjs().toDate(),
            },
        },
    });
}
