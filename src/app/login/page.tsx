import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createLoginLink, isValidEmail, normalizeEmail } from "@/lib/auth";
import { sendLoginEmail } from "@/lib/email";
import { clientIp } from "@/lib/request";
import { LIMITS, rateLimit } from "@/lib/rate-limit";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

async function requestLink(formData: FormData) {
  "use server";
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const next = String(formData.get("next") ?? "/");
  if (!isValidEmail(email)) redirect(`/login?error=email&next=${encodeURIComponent(next)}`);
  const allowed = (await rateLimit(LIMITS.loginPerEmail, email)) && (await rateLimit(LIMITS.loginPerIp, await clientIp()));
  if (!allowed) redirect(`/login?error=rate&next=${encodeURIComponent(next)}`);
  const link = await createLoginLink(email, next);
  await sendLoginEmail(email, link);
  redirect(`/login?sent=1`);
}

const ERRORS: Record<string, string> = {
  email: "Enter a valid email address.",
  rate: "Too many sign-in requests. Please wait and try again.",
  expired: "That sign-in link is invalid, expired or already used. Request a new one.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; sent?: string; error?: string }> }) {
  const { next = "/", sent, error } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <p className="label">Account</p>
      <h1 className="h-display mt-2 text-6xl">Sign in</h1>
      {sent ? (
        <p className="mt-8 border border-agreed p-4 text-agreed">Check your inbox for a one-time sign-in link. It expires in 20 minutes.</p>
      ) : (
        <form action={requestLink} className="mt-8 grid gap-4">
          <input type="hidden" name="next" value={next} />
          <label className="block">
            <span className="label">Email</span>
            <input name="email" type="email" required autoComplete="email" className="input mt-1" placeholder="you@example.com" />
          </label>
          {error && ERRORS[error] && <p className="text-sm text-danger">{ERRORS[error]}</p>}
          <button className="btn-primary justify-center">Email me a sign-in link</button>
          <p className="text-xs text-muted">
            No passwords. Your email is never shown publicly or included in analytics. Verification is a baseline against abuse — it does not prove one person per account, so we also use rate limits and show results from established accounts separately.
          </p>
        </form>
      )}
    </div>
  );
}
