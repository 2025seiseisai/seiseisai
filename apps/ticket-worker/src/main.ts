import { dbClient } from "@seiseisai/database/db-client";
import cron from "node-cron";

cron.schedule("30 * * * * *", () => {
    // 有効期限切れのユーザーを削除
    dbClient.ticketUser.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });
});
