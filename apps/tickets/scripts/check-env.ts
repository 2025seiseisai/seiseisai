import assert from "assert";

assert(process.env.DATABASE_URL, "DATABASE_URL is not set");
assert(process.env.DIRECT_URL, "DIRECT_URL is not set");
assert(process.env.AUTH_URL, "AUTH_URL is not set");
assert(process.env.AUTH_SECRET_TICKETS, "AUTH_SECRET_TICKETS is not set");
assert(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY_TICKETS, "NEXT_PUBLIC_TURNSTILE_SITE_KEY_TICKETS is not set");
assert(process.env.TURNSTILE_SECRET_KEY_TICKETS, "TURNSTILE_SECRET_KEY_TICKETS is not set");
assert(process.env.TICKET_HMAC_KEY_AUTH, "TICKET_HMAC_KEY_AUTH is not set");
assert(process.env.TICKET_HMAC_KEY_LOGIN, "TICKET_HMAC_KEY_LOGIN is not set");
