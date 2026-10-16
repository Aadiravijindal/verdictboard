import type { Metadata } from "next";

export const metadata: Metadata = { title: "Confirm sign-in", robots: { index: false } };

// Sign-in is confirmed with a POST so that email link scanners, which pre-fetch
// links with GET, cannot consume the single-use token.
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string; next?: string }> }) {
  const { token = "", next = "/" } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="h-display text-5xl">Confirm sign-in</h1>
      <form action="/auth/confirm" method="post" className="mt-8">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="next" value={next} />
        <button className="btn-primary">Sign in to VerdictBoard</button>
      </form>
    </div>
  );
}
