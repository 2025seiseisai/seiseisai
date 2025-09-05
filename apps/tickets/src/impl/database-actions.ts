"use server";
import { auth } from "@/impl/auth";
import * as Operations from "@seiseisai/database";

export async function createTicket(eventId: string, paperTickets: number) {
    const userId = await auth();
    if (!userId) return null;
    return await Operations.createTicket(eventId, userId, paperTickets);
}

export async function updateTicket(eventId: string, paperTickets: number) {
    const userId = await auth();
    if (!userId) return null;
    return await Operations.updateTicket(eventId, userId, paperTickets);
}

export async function deleteTicket(eventId: string) {
    const userId = await auth();
    if (!userId) return null;
    return await Operations.deleteTicket(eventId, userId);
}
