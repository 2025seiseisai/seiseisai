import "dotenv/config";
import { defineConfig } from "prisma/config";

let url = process.env.DATABASE_URL;
if (!url) url = "dummy";

export default defineConfig({
    schema: "packages/database/prisma/schema.prisma",
    migrations: {
        path: "packages/database/prisma/migrations",
    },
    datasource: {
        url,
    },
});
