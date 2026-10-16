import { env } from "./env";

/**
 * Sends the sign-in email through Resend's HTTP API. In development without a
 * key, the link is printed to the server console instead (also allowed in a
 * production build when EMAIL_LOG_LINKS=true, for local staging only).
 */
export async function sendLoginEmail(to: string, link: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (env.isProd && process.env.EMAIL_LOG_LINKS !== "true") throw new Error("RESEND_API_KEY is required in production to send sign-in links");
    console.log(`\n[VerdictBoard] Sign-in link for ${to}:\n${link}\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "VerdictBoard <login@verdictboard.org>",
      to: [to],
      subject: "Your VerdictBoard sign-in link",
      text: `Sign in to VerdictBoard:\n\n${link}\n\nThis link works once and expires in 20 minutes. If you didn't request it, ignore this email.`,
      html: `<p>Sign in to VerdictBoard:</p><p><a href="${link}">Sign in</a></p><p>This link works once and expires in 20 minutes. If you didn't request it, ignore this email.</p>`,
    }),
  });
  if (!res.ok) throw new Error(`Email provider returned ${res.status}`);
}
