const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Verifies a Cloudflare Turnstile token server-side. Never trust a client-supplied "verified" flag. */
export async function verifyTurnstileToken(token: string, remoteIp?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY is not set — refusing to accept the form as verified.");
    return false;
  }

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[turnstile] verification request failed:", err);
    return false;
  }
}
