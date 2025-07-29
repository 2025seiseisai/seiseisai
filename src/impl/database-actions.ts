"use server";
import { getAuthSession } from "./auth";
import {
    createNews as addNews_,
    updateNewsSafe as changeNewsSafe_,
    updateNewsUnsafe as changeNewsUnsafe_,
    deleteNews as deleteNews_,
    getAdminById as getAdminById_,
    getAllAdmins as getAllAdmins_,
    getAllNews as getAllNews_,
    NewsModel,
} from "./database";

export async function getAdminById(id: string) {
    if (!(await getAuthSession())?.authorityAdmins) return null;
    return await getAdminById_(id);
}

export async function getAllAdmins() {
    if (!(await getAuthSession())?.authorityAdmins) return null;
    return await getAllAdmins_();
}

export async function getAllNews() {
    if (!(await getAuthSession())?.authorityNews) return null;
    return await getAllNews_();
}

export async function deleteNews(id: string) {
    if (!(await getAuthSession())?.authorityNews) return null;
    return await deleteNews_(id);
}

export async function updateNewsSafe(prev_data: NewsModel, new_data: NewsModel) {
    if (!(await getAuthSession())?.authorityNews) return null;
    return await changeNewsSafe_(prev_data, new_data);
}

export async function updateNewsUnsafe(new_data: NewsModel) {
    if (!(await getAuthSession())?.authorityNews) return null;
    return await changeNewsUnsafe_(new_data);
}

export async function createNews(data: NewsModel) {
    if (!(await getAuthSession())?.authorityNews) return null;
    return await addNews_(data);
}
