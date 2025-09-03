import assert from "assert";
import config from "../../settings/next.config";

assert(process.env.DATABASE_URL, "DATABASE_URL is not set");
assert(process.env.DIRECT_URL, "DIRECT_URL is not set");
assert(process.env.AUTH_URL, "AUTH_URL is not set");
assert(process.env.AUTH_SECRET_ADMIN, "AUTH_SECRET_ADMIN is not set");
assert(process.env.HASH_SALT, "HASH_SALT is not set");
assert(process.env.SUPERADMIN_HASHED_PASSWORD, "SUPERADMIN_HASHED_PASSWORD is not set");
assert(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_ADMIN, "NEXT_PUBLIC_TURNSTILE_SITE_KEY_ADMIN is not set");
assert(process.env.TURNSTILE_SECRET_KEY_ADMIN, "TURNSTILE_SECRET_KEY_ADMIN is not set");
assert(process.env.TICKET_HMAC_KEY_AUTH, "TICKET_HMAC_KEY_AUTH is not set");

export default config;
