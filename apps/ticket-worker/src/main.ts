import { dbClient } from "@seiseisai/database/db-client";
import { TicketStatus } from "@seiseisai/database/enums";
import dayjs from "@seiseisai/date";
import cron from "node-cron";

cron.schedule("30 * * * * *", async () => {
    try {
        const now = dayjs();

        // 有効期限切れのユーザーを削除
        await dbClient.ticketUser.deleteMany({
            where: {
                expiresAt: {
                    lt: now.toDate(),
                },
            },
        });

        // 抽選がまだ行われていないイベントで、募集締め切りを過ぎているものを抽選
        const events = await dbClient.eventTicketInfo.findMany({
            where: {
                applicationEnd: {
                    lt: now.toDate(),
                },
                drawResult: null,
            },
        });

        for (const event of events) {
            const tickets = await dbClient.ticket.findMany({
                where: {
                    eventId: event.id,
                },
            });
            await dbClient.ticket.updateMany({
                where: {
                    id: { in: tickets.map((t) => t.id) },
                },
                data: {
                    status: TicketStatus.落選, // TODO: ちゃんと実装する
                },
            });
            await dbClient.eventDrawResult.create({
                data: {
                    eventId: event.id,
                    totalApplications: tickets.length,
                    winners: 0,
                },
            });
        }
    } catch (e) {
        console.error("Error in ticket worker cron job:", e);
    }
});
