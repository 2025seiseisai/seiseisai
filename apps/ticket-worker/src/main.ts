import { deleteExpiredTicketUsers } from "@seiseisai/database";
import cron from "node-cron";

cron.schedule("30 * * * * *", async () => {
    // 有効期限切れのユーザーを削除
    await deleteExpiredTicketUsers();
});
