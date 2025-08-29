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
    const count1 = await dbClient.admin.count({
        where: {
            id: admin.id,
        },
    });
    if (count1 > 0) return null;
    const count2 = await dbClient.admin.count({
        where: {
            name: admin.name,
        },
    });
    if (count2 > 0) return null;
    await dbClient.admin.create({
        data: admin,
    });
    await dbClient.adminPassword.create({
        data: {
            adminId: admin.id,
            hashedPassword: passwordHash(password),
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
    const id = prev_data.id;
    if (id === "superadmin") return UpdateResult.Invalid;
    const current = await dbClient.admin.findUnique({
        where: {
            id,
        },
    });
    if (!current) return UpdateResult.NotFound;
    const nameExists = await dbClient.admin.count({
        where: {
            name: new_data.name,
            id: {
                not: id,
            },
        },
    });
    if (nameExists > 0) return UpdateResult.NameExists;
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
    const count1 = await dbClient.goods.count({
        where: {
            id: goods.id,
        },
    });
    if (count1 > 0) return null;
    const count2 = await dbClient.goods.count({
        where: {
            name: goods.name,
        },
    });
    if (count2 > 0) return null;
    return await dbClient.goods.create({
        data: goods,
    });
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
    const id = prev_data.id;
    const current = await dbClient.goods.findUnique({
        where: {
            id,
        },
    });
    if (!current) return UpdateResult.NotFound;
    if (!allow_name_change && current.name !== prev_data.name) return UpdateResult.Invalid;
    const nameExists = await dbClient.goods.count({
        where: {
            name: new_data.name,
            id: {
                not: id,
            },
        },
    });
    if (nameExists > 0) return UpdateResult.NameExists;
    const assign: Partial<GoodsModel> = {};
    if (prev_data.name !== new_data.name) {
        if (current.name !== prev_data.name) return UpdateResult.Overwrite;
        else assign.name = new_data.name;
    }
    if (prev_data.stock !== new_data.stock) {
        if (current.stock !== prev_data.stock) return UpdateResult.Overwrite;
        else assign.stock = new_data.stock;
    }
    if (Object.keys(assign).length === 0) return UpdateResult.NoChange;
    await dbClient.goods.update({
        where: {
            id,
        },
        data: assign,
    });
    return UpdateResult.Success;
}

export async function updateGoodsUnsafe(new_data: GoodsModel, allow_name_change = false) {
    if (allow_name_change) {
        const result = await dbClient.goods.updateMany({
            where: {
                id: new_data.id,
            },
            data: new_data,
        });
        return result.count > 0 ? true : null;
    } else {
        const current = await dbClient.goods.findUnique({
            where: {
                id: new_data.id,
            },
        });
        if (!current) return null;
        if (current.name !== new_data.name) return null;
        const result = await dbClient.goods.updateMany({
            where: {
                id: new_data.id,
            },
            data: {
                stock: new_data.stock,
            },
        });
        return result.count > 0 ? true : null;
    }
}

/* =========================
 * EventTicketInfo
 * ========================= */

export async function getAllEventTicketInfos() {
    return await dbClient.eventTicketInfo.findMany({
        orderBy: {
            applicationStart: "asc",
        },
    });
}

export async function createEventTicketInfo(data: EventTicketInfoModel) {
    // uniqueness check (id & name)
    const countId = await dbClient.eventTicketInfo.count({ where: { id: data.id } });
    if (countId > 0) return null;
    const countName = await dbClient.eventTicketInfo.count({ where: { name: data.name } });
    if (countName > 0) return null;
    await dbClient.eventTicketInfo.create({ data });
    return true;
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
    const id = prev_data.id;
    const currentRaw = await dbClient.eventTicketInfo.findUnique({
        where: { id },
    });
    if (!currentRaw) return UpdateResult.NotFound;
    const current = currentRaw;
    // name uniqueness
    if (prev_data.name !== new_data.name) {
        const nameExists = await dbClient.eventTicketInfo.count({
            where: {
                name: new_data.name,
                id: {
                    not: id,
                },
            },
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
    await dbClient.eventTicketInfo.update({
        where: { id },
        data: assign,
    });
    return UpdateResult.Success;
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
                lt: new Date(),
            },
        },
    });
}
