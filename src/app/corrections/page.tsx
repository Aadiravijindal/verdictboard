import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/labels";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Corrections log" };

export default async function CorrectionsPage() {
  const rows = await prisma.correction.findMany({ orderBy: { createdAt: "desc" }, take: 500, include: { claim: true, topic: true } });
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="h-display text-6xl">Corrections log</h1>
      <p className="mt-4 max-w-prose text-muted">
        Every material change to a published dossier — its label, reason, proposition or scope, and any accepted correction — is listed here with what changed, when and why. We never silently rewrite a dossier.
      </p>
      {rows.length === 0 ? (
        <p className="mt-10 panel p-5">No corrections have been issued yet.</p>
      ) : (
        <ol className="mt-10 space-y-3">
          {rows.map((c) => (
            <li key={c.id} className="panel p-4 text-sm">
              <p className="label">{formatDate(c.createdAt)} · {c.field}</p>
              <p className="mt-1 font-semibold">{c.claim ? <Link href={`/claims/${c.claim.slug}`}>{c.claim.code} — {c.claim.headline}</Link> : c.topic?.title}</p>
              <p className="mt-1">{c.summary}</p>
              <p className="mt-1 text-muted">Reason: {c.reason}</p>
              {c.before !== null && <p className="mt-1 break-words font-mono text-xs text-muted">Before: {JSON.stringify(c.before)} → After: {JSON.stringify(c.after)}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
