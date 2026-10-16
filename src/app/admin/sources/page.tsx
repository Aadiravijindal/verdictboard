import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/labels";

export default async function LinkHealth() {
  const sources = await prisma.source.findMany({ orderBy: [{ lastHttpStatus: "asc" }, { title: "asc" }], include: { _count: { select: { evidence: true } } } });
  const unchecked = sources.filter((s) => !s.lastCheckedAt).length;
  return (
    <div>
      <p className="max-w-prose text-sm text-muted">
        Run <code>npm run check:sources</code> on a schedule from a machine with open internet access to update link status. {unchecked} of {sources.length} sources have never been checked. HTTP 403/429 usually means a site blocks automated checks — verify by hand.
      </p>
      <table className="mt-6 w-full text-left text-sm">
        <thead><tr className="label"><th className="py-2">Source</th><th>Status</th><th>Checked</th><th>Cited</th></tr></thead>
        <tbody className="divide-y divide-line">
          {sources.map((s) => {
            const bad = s.lastHttpStatus === 0 || s.lastHttpStatus === 404 || s.lastHttpStatus === 410;
            return (
              <tr key={s.id}>
                <td className="py-2 pr-4"><Link href={`/sources/${s.slug}`}>{s.title}</Link><p className="break-all text-xs text-muted">{s.url}</p></td>
                <td className={`font-mono text-xs ${bad ? "text-danger" : "text-muted"}`}>{s.lastHttpStatus ?? "—"}</td>
                <td className="text-muted">{s.lastCheckedAt ? formatDate(s.lastCheckedAt) : "never"}</td>
                <td>{s._count.evidence}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
