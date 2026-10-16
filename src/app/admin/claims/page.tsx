import Link from "next/link";
import type { PublishStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/labels";

const STATES: PublishStatus[] = ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"];

export default async function AdminClaims({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const where = STATES.includes(status as PublishStatus) ? { publishStatus: status as PublishStatus } : {};
  const claims = await prisma.claim.findMany({ where, include: { topic: true, _count: { select: { evidence: true, reports: { where: { status: "OPEN" } } } } }, orderBy: { updatedAt: "desc" } });
  return (
    <div>
      <div className="flex flex-wrap gap-3 font-mono text-xs uppercase">
        <Link href="/admin/claims">All</Link>
        {STATES.map((s) => <Link key={s} href={`/admin/claims?status=${s}`}>{s.replace("_", " ")}</Link>)}
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead><tr className="label"><th className="py-2">Claim</th><th>Workflow</th><th>Label</th><th>Evidence</th><th>Open challenges</th><th>Updated</th></tr></thead>
        <tbody className="divide-y divide-line">
          {claims.map((c) => (
            <tr key={c.id}>
              <td className="py-2 pr-4"><Link href={`/admin/claims/${c.id}`}>{c.code} — {c.headline}</Link><p className="text-xs text-muted">{c.topic.title}{c.aiAssisted ? " · AI-assisted" : ""}</p></td>
              <td className="font-mono text-xs">{c.publishStatus}</td>
              <td><StatusBadge status={c.status} /></td>
              <td>{c._count.evidence}</td>
              <td>{c._count.reports}</td>
              <td className="text-muted">{formatDate(c.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
