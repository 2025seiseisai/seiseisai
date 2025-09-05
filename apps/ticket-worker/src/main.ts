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

        await dbClient.$transaction(async (tx) => {
            // 当選したかつ引き換え締め切りを過ぎたがまだ整理券が引き換えられていない場合、ユーザーをBANする
            await tx.ticketUser.updateMany({
                where: {
                    tickets: {
                        some: {
                            status: TicketStatus.当選,
                            event: {
                                eventStart: {
                                    lt: now.toDate(),
                                },
                            },
                        },
                    },
                    banned: false,
                },
                data: {
                    banned: true,
                },
            });
            // 引き換え期限を過ぎた整理券を削除する
            await tx.ticket.deleteMany({
                where: {
                    event: {
                        eventStart: {
                            lt: now.toDate(),
                        },
                    },
                },
            });
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
            await dbClient.$transaction(async (tx) => {
                const tickets = await tx.ticket.findMany({
                    where: {
                        eventId: event.id,
                    },
                });
                const users = await tx.ticketUser.findMany({
                    where: {
                        tickets: {
                            some: {
                                eventId: event.id,
                            },
                        },
                    },
                });
                const usersDict = users.reduce(
                    (acc, user) => {
                        acc[user.id] = user;
                        return acc;
                    },
                    {} as Record<string, (typeof users)[0]>,
                );
                const capacity = event.capacity;
                const winners: string[] = [];
                let totalWinners = 0;
                let totalApplications = 0;
                for (let i = 0; i < tickets.length; i++) {
                    const j = Math.floor(Math.random() * (tickets.length - i)) + i;
                    [tickets[i], tickets[j]] = [tickets[j], tickets[i]];
                    const ticket = tickets[i];
                    totalApplications += ticket.paperTickets;
                    const user = usersDict[ticket.userId];
                    if (!user.banned && totalWinners + ticket.paperTickets <= capacity) {
                        winners.push(ticket.id);
                        totalWinners += ticket.paperTickets;
                    }
                }
                await tx.ticket.updateMany({
                    where: {
                        id: {
                            in: winners,
                        },
                    },
                    data: {
                        status: TicketStatus.当選,
                    },
                });
                await tx.ticket.updateMany({
                    where: {
                        id: {
                            notIn: winners,
                        },
                        eventId: event.id,
                    },
                    data: {
                        status: TicketStatus.落選,
                    },
                });
                await tx.eventDrawResult.create({
                    data: {
                        eventId: event.id,
                        totalApplications: totalApplications,
                        winners: totalWinners,
                    },
                });
            });
        }
    } catch (e) {
        console.error("Error in ticket worker cron job:", e);
    }
});
