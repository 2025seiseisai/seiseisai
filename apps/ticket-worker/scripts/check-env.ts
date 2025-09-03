import assert from "assert";

assert(process.env.DATABASE_URL, "DATABASE_URL is not set");
assert(process.env.DIRECT_URL, "DIRECT_URL is not set");
