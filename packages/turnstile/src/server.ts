export default async function verifyTurnstileToken(token: string, secretKey: string): Promise<boolean> {
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            secret: secretKey,
            response: token,
        }),
    });
    const verifyData = await verifyRes.json();
    return verifyData && verifyData.success;
}
