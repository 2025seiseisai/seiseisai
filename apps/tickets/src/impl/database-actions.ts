"use server";
import { auth } from "@/impl/auth";
import * as Operations from "@seiseisai/database";
import * as z from "zod";

const eventIdSchema = z.string().min(16).max(64);
const paperTicketsSchema = z.int32().min(0).max(10);

export async function createTicket(eventId: string, paperTickets: number) {
    if (!eventIdSchema.safeParse(eventId).success) return null;
    if (!paperTicketsSchema.safeParse(paperTickets).success) return null;
    const userId = await auth();
    if (!userId) return null;
    return await Operations.createTicket(eventId, userId, paperTickets);
}

export async function updateTicket(eventId: string, paperTickets: number) {
    if (!eventIdSchema.safeParse(eventId).success) return null;
    if (!paperTicketsSchema.safeParse(paperTickets).success) return null;
    const userId = await auth();
    if (!userId) return null;
    return await Operations.updateTicket(eventId, userId, paperTickets);
}

export async function deleteTicket(eventId: string) {
    if (!eventIdSchema.safeParse(eventId).success) return null;
    const userId = await auth();
    if (!userId) return null;
    return await Operations.deleteTicket(eventId, userId);
}
