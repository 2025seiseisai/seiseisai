"use server";
import type { AdminModel, GoodsModel, NewsModel } from "@/impl/models";
import { auth } from "./auth";
import * as Operations from "./database";

export async function getAdminById(id: string) {
    if (!(await auth())?.authorityAdmins) return null;
    return await Operations.getAdminById(id);
}

export async function getAllAdmins() {
    if (!(await auth())?.authorityAdmins) return null;
    return await Operations.getAllAdmins();
}

export async function createAdmin(admin: AdminModel, password: string) {
    if (!(await auth())?.authorityAdmins) return null;
    return await Operations.createAdmin(admin, password);
}

export async function deleteAdmin(id: string) {
    if (!(await auth())?.authorityAdmins) return null;
    return await Operations.deleteAdmin(id);
}

export async function updateAdminPassword(id: string, new_password: string) {
    if (!(await auth())?.authorityAdmins) return null;
    return await Operations.updateAdminPassword(id, new_password);
}

export async function updateAdminSafe(prev_data: AdminModel, new_data: AdminModel) {
    if (!(await auth())?.authorityAdmins) return null;
    return await Operations.updateAdminSafe(prev_data, new_data);
}

export async function updateAdminUnsafe(new_data: AdminModel) {
    if (!(await auth())?.authorityAdmins) return null;
    return await Operations.updateAdminUnsafe(new_data);
}

export async function getAllNews() {
    if (!(await auth())?.authorityNews) return null;
    return await Operations.getAllNews();
}

export async function deleteNews(id: string) {
    if (!(await auth())?.authorityNews) return null;
    return await Operations.deleteNews(id);
}

export async function updateNewsSafe(prev_data: NewsModel, new_data: NewsModel) {
    if (!(await auth())?.authorityNews) return null;
    return await Operations.updateNewsSafe(prev_data, new_data);
}

export async function updateNewsUnsafe(new_data: NewsModel) {
    if (!(await auth())?.authorityNews) return null;
    return await Operations.updateNewsUnsafe(new_data);
}

export async function createNews(data: NewsModel) {
    if (!(await auth())?.authorityNews) return null;
    return await Operations.createNews(data);
}

export async function getAllGoods() {
    const session = await auth();
    if (!session || (!session.authorityGoods && !session.authorityGoodsStock)) return null;
    return await Operations.getAllGoods();
}

export async function createGoods(goods: GoodsModel) {
    if (!(await auth())?.authorityGoods) return null;
    return await Operations.createGoods(goods);
}

export async function deleteGoods(id: string) {
    if (!(await auth())?.authorityGoods) return null;
    return await Operations.deleteGoods(id);
}

export async function updateGoodsSafe(prev_data: GoodsModel, new_data: GoodsModel) {
    const session = await auth();
    if (!session || (!session.authorityGoods && !session.authorityGoodsStock)) return null;
    return await Operations.updateGoodsSafe(prev_data, new_data, session.authorityGoods);
}

export async function updateGoodsUnsafe(new_data: GoodsModel) {
    const session = await auth();
    if (!session || (!session.authorityGoods && !session.authorityGoodsStock)) return null;
    return await Operations.updateGoodsUnsafe(new_data, session.authorityGoods);
}
