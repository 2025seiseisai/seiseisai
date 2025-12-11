"use server";
import * as Operations from "@seiseisai/database";
import type { AdminModel, EventTicketInfoModel, GoodsModel, NewsModel } from "@seiseisai/database/models";
import { auth, getHashedPassword } from "./auth";
import {
    adminIdSchema,
    adminSchema,
    goodsIdSchema,
    goodsSchema,
    newsIdSchema,
    newsSchema,
    passwordSchema,
    signatureSchema,
    ticketIdSchema,
    ticketInfoIdSchema,
    ticketInfoSchema,
} from "./schemas";

export async function getAdminById(id: string) {
    if (!adminIdSchema.safeParse(id).success) return null;
    if (!(await auth())?.authorityAdmins) return null;
    return await Operations.getAdminById(id);
}

export async function getAllAdmins() {
    if (!(await auth())?.authorityAdmins) return null;
    return await Operations.getAllAdmins();
}

export async function createAdmin(admin: AdminModel, password: string) {
    if (!adminSchema.safeParse(admin).success) return null;
    if (!passwordSchema.safeParse(password).success) return null;
    if (!(await auth())?.authorityAdmins) return null;
    if (!process.env.HASH_SALT) return null;
    return await Operations.createAdmin(admin, password, getHashedPassword);
}

export async function deleteAdmin(id: string) {
    if (!adminIdSchema.safeParse(id).success) return null;
    if (!(await auth())?.authorityAdmins) return null;
    return await Operations.deleteAdmin(id);
}

export async function updateAdminPassword(id: string, new_password: string) {
    if (!adminIdSchema.safeParse(id).success) return null;
    if (!passwordSchema.safeParse(new_password).success) return null;
    if (!(await auth())?.authorityAdmins) return null;
    if (!process.env.HASH_SALT) return null;
    return await Operations.updateAdminPassword(id, new_password, getHashedPassword);
}

export async function updateAdminSafe(prev_data: AdminModel, new_data: AdminModel) {
    if (!adminSchema.safeParse(prev_data).success) return null;
    if (!adminSchema.safeParse(new_data).success) return null;
    if (!(await auth())?.authorityAdmins) return null;
    return await Operations.updateAdminSafe(prev_data, new_data);
}

export async function updateAdminUnsafe(new_data: AdminModel) {
    if (!adminSchema.safeParse(new_data).success) return null;
    if (!(await auth())?.authorityAdmins) return null;
    return await Operations.updateAdminUnsafe(new_data);
}

export async function getAllNews() {
    if (!(await auth())?.authorityNews) return null;
    return await Operations.getAllNews();
}

export async function deleteNews(id: string) {
    if (!newsIdSchema.safeParse(id).success) return null;
    if (!(await auth())?.authorityNews) return null;
    return await Operations.deleteNews(id);
}

export async function updateNewsSafe(prev_data: NewsModel, new_data: NewsModel) {
    if (!newsSchema.safeParse(prev_data).success) return null;
    if (!newsSchema.safeParse(new_data).success) return null;
    if (!(await auth())?.authorityNews) return null;
    return await Operations.updateNewsSafe(prev_data, new_data);
}

export async function updateNewsUnsafe(new_data: NewsModel) {
    if (!newsSchema.safeParse(new_data).success) return null;
    if (!(await auth())?.authorityNews) return null;
    return await Operations.updateNewsUnsafe(new_data);
}

export async function createNews(data: NewsModel) {
    if (!newsSchema.safeParse(data).success) return null;
    if (!(await auth())?.authorityNews) return null;
    return await Operations.createNews(data);
}

export async function getAllGoods() {
    const session = await auth();
    if (!session || (!session.authorityGoods && !session.authorityGoodsStock)) return null;
    return await Operations.getAllGoods();
}

export async function createGoods(goods: GoodsModel) {
    if (!goodsSchema.safeParse(goods).success) return null;
    if (!(await auth())?.authorityGoods) return null;
    return await Operations.createGoods(goods);
}

export async function deleteGoods(id: string) {
    if (!goodsIdSchema.safeParse(id).success) return null;
    if (!(await auth())?.authorityGoods) return null;
    return await Operations.deleteGoods(id);
}

export async function updateGoodsSafe(prev_data: GoodsModel, new_data: GoodsModel) {
    if (!goodsSchema.safeParse(prev_data).success) return null;
    if (!goodsSchema.safeParse(new_data).success) return null;
    const session = await auth();
    if (!session || (!session.authorityGoods && !session.authorityGoodsStock)) return null;
    return await Operations.updateGoodsSafe(prev_data, new_data, session.authorityGoods);
}

export async function updateGoodsUnsafe(new_data: GoodsModel) {
    if (!goodsSchema.safeParse(new_data).success) return null;
    const session = await auth();
    if (!session || (!session.authorityGoods && !session.authorityGoodsStock)) return null;
    return await Operations.updateGoodsUnsafe(new_data, session.authorityGoods);
}

export async function getAllEventTicketInfos() {
    if (!(await auth())?.authorityTickets) return null;
    return await Operations.getAllEventTicketInfo();
}

export async function getEventTicketInfo(id: string) {
    if (!ticketInfoIdSchema.safeParse(id).success) return null;
    const session = await auth();
    if (!session || (!session.authorityTickets && !session.authorityTicketVerification)) return null;
    return await Operations.getEventTicketInfo(id);
}

export async function createEventTicketInfo(data: EventTicketInfoModel) {
    if (!ticketInfoSchema.safeParse(data).success) return null;
    if (!(await auth())?.authorityTickets) return null;
    return await Operations.createEventTicketInfo(data);
}

export async function deleteEventTicketInfo(id: string) {
    if (!ticketInfoIdSchema.safeParse(id).success) return null;
    if (!(await auth())?.authorityTickets) return null;
    return await Operations.deleteEventTicketInfo(id);
}

export async function updateEventTicketInfoSafe(prev_data: EventTicketInfoModel, new_data: EventTicketInfoModel) {
    if (!ticketInfoSchema.safeParse(prev_data).success) return null;
    if (!ticketInfoSchema.safeParse(new_data).success) return null;
    if (!(await auth())?.authorityTickets) return null;
    return await Operations.updateEventTicketInfoSafe(prev_data, new_data);
}

export async function updateEventTicketInfoUnsafe(new_data: EventTicketInfoModel) {
    if (!ticketInfoSchema.safeParse(new_data).success) return null;
    if (!(await auth())?.authorityTickets) return null;
    return await Operations.updateEventTicketInfoUnsafe(new_data);
}

export async function getAllDrawResults() {
    if (!(await auth())?.authorityTickets) return null;
    return await Operations.getAllDrawResults();
}

export async function verifyTicket(id: string, sig: string) {
    if (!ticketIdSchema.safeParse(id).success) return null;
    if (!signatureSchema.safeParse(sig).success) return null;
    if (!(await auth())?.authorityTicketVerification) return null;
    return await Operations.verifyTicket(id, sig);
}
