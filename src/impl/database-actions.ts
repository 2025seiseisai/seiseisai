"use server";
import { getAuthSession } from "./auth";
import { deleteNews as deleteNews_, getAdminById as getAdminById_, getAllNews as getAllNews_ } from "./database";

export async function getAdminById(id: string) {
    if (!(await getAuthSession())?.authorityAdmins) return null;
    return await getAdminById_(id);
}

export async function getAllNews() {
    if (!(await getAuthSession())?.authorityNews) return null;
    return await getAllNews_();
}

export async function deleteNews(id: string) {
    if (!(await getAuthSession())?.authorityNews) return null;
    return await deleteNews_(id);
}
