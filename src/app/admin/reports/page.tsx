import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/labels";
import { resolveReport } from "../actions";
import { ErrorBanner } from "@/components/ErrorBanner";

export default async function ReportsQueue({ searchParams }: { searchParams: Promise<{ error?: string; status?: string }> }) {
  const { error, status } = await searchParams;
  const reports = await prisma.report.findMany({
    where: { status: status === "closed" ? { not: "OPEN" } : "OPEN" },
    include: { claim: true, source: true, user: { select: { email: true, createdAt: true } }, resolvedBy: { select: { email: true } } },
    orderBy: { createdAt: status === "closed" ? "desc" : "asc" },
    take: 100,
  });
  return (
    <div>
      <ErrorBanner error={error} />
      <div className="flex gap-4 font-mono text-xs uppercase"><Link href="/admin/reports">Open</Link><Link href="/admin/reports?status=closed">Decided</Link></div>
      <p className="mt-4 max-w-prose text-sm text-muted">Decide challenges by the published rules. Accepting a challenge does not change the dossier by itself — edit the claim, which records a public correction.</p>
      <ul className="mt-6 space-y-4">
        {reports.length === 0 && <li className="text-muted">Nothing here.</li>}
        {reports.map((r) => (
          <li key={r.id} className="panel p-4 text-sm">
            <p className="label">{r.kind} · {formatDate(r.createdAt)} · {r.user?.email ?? "deleted user"} (joined {formatDate(r.user?.createdAt)})</p>
            {r.claim && <p className="mt-1">On <Link href={`/admin/claims/${r.claim.id}`}>{r.claim.code} — {r.claim.headline}</Link></p>}
            {r.source && <p className="mt-1">Source: {r.source.title}</p>}
            <p className="mt-2 whitespace-pre-wrap">{r.body}</p>
            {r.url && <p className="mt-2 break-all"><a href={r.url} target="_blank" rel="noopener noreferrer nofollow">{r.url}</a></p>}
            {r.status === "OPEN" ? (
              <form action={resolveReport} className="mt-3 flex flex-wrap gap-2">
                <input type="hidden" name="id" value={r.id} />
                <input name="resolution" required minLength={10} className="input min-w-64 flex-1" placeholder="Reason for decision" />
                <label className="flex items-center gap-1"><input type="radio" name="status" value="ACCEPTED" required className="accent-[#B8F36B]" /> Accept</label>
                <label className="flex items-center gap-1"><input type="radio" name="status" value="REJECTED" className="accent-[#B8F36B]" /> Reject</label>
                <button className="btn-primary">Record decision</button>
              </form>
            ) : (
              <p className="mt-3 text-muted">{r.status} by {r.resolvedBy?.email} on {formatDate(r.resolvedAt)}: {r.resolution}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
