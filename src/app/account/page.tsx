import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { COUNTRIES, LEANINGS, formatDate } from "@/lib/labels";
import Link from "next/link";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

async function saveProfile(formData: FormData) {
  "use server";
  const user = await requireUser("/account");
  const country = String(formData.get("country") ?? "");
  const leaning = String(formData.get("leaning") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim().slice(0, 40) || null;
  await prisma.user.update({
    where: { id: user.id },
    data: { country: COUNTRIES.includes(country) ? country : null, leaning: LEANINGS.includes(leaning) ? leaning : null, displayName },
  });
  revalidatePath("/account");
}

async function deleteAccount() {
  "use server";
  const user = await requireUser("/account");
  await prisma.user.delete({ where: { id: user.id } });
  const { redirect } = await import("next/navigation");
  redirect("/");
}

export default async function AccountPage() {
  const user = await requireUser("/account");
  const votes = await prisma.vote.findMany({ where: { userId: user.id }, include: { claim: true, changes: true }, orderBy: { updatedAt: "desc" } });
  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-14 sm:px-6">
      <span className="eyebrow">Account · {user.role.toLowerCase()}</span>
      <h1 className="h-display mt-4 text-[44px] sm:text-6xl">Your account</h1>
      <p className="mt-2 text-muted">{user.email} · member since {formatDate(user.createdAt)}</p>

      <form action={saveProfile} className="mt-10 grid gap-4 panel p-5">
        <p className="label">Optional profile — used only for aggregate breakdowns</p>
        <label><span className="label">Display name</span><input name="displayName" defaultValue={user.displayName ?? ""} className="input mt-1" maxLength={40} /></label>
        <label><span className="label">Country (self-reported)</span>
          <select name="country" defaultValue={user.country ?? ""} className="input mt-1">
            <option value="">Prefer not to say</option>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label><span className="label">Political leaning (self-reported)</span>
          <select name="leaning" defaultValue={user.leaning ?? ""} className="input mt-1">
            <option value="">Prefer not to say</option>
            {LEANINGS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <p className="text-xs text-muted">We never infer these from your behaviour. Groups smaller than the published minimum are never shown.</p>
        <div><button className="btn-primary">Save</button></div>
      </form>

      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="label">Your assessments</h2>
        {votes.length === 0 ? <p className="mt-3 text-muted">You haven&apos;t assessed any claims yet.</p> : (
          <ul className="mt-3 divide-y divide-line border border-line">
            {votes.map((v) => (
              <li key={v.id} className="p-4 text-sm">
                <Link href={`/claims/${v.claim.slug}`}>{v.claim.headline}</Link>
                <p className="text-muted">{v.phase === "BEFORE" ? "First impression" : "After reading"}: {v.stance.toLowerCase()} at {v.confidence}% · {v.changes.length} change{v.changes.length === 1 ? "" : "s"}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <form action="/auth/signout" method="post"><button className="btn-ghost">Sign out</button></form>
        <form action={deleteAccount}><button className="btn-ghost border-danger text-danger">Delete account and votes</button></form>
      </div>
    </div>
  );
}
