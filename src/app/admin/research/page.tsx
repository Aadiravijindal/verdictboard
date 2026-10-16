import Link from "next/link";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { formatDate } from "@/lib/labels";
import { startResearch } from "../actions";
import { ErrorBanner } from "@/components/ErrorBanner";

export default async function ResearchDesk({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const [jobs, topics] = await Promise.all([
    prisma.researchJob.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { createdBy: true } }),
    prisma.topic.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <div>
      <ErrorBanner error={error} />
      <h1 className="text-2xl font-semibold">Research desk</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        The assistant searches for primary records and original reporting, extracts exact passages and drafts a dossier. Nothing it produces is published without editor approval and a second reviewer. Each run takes a few minutes and uses web search.
      </p>
      {env.aiEnabled ? (
        <form action={startResearch} className="mt-6 grid max-w-3xl gap-3 panel p-5">
          <label><span className="label">Claim to investigate</span>
            <textarea name="input" required minLength={15} maxLength={2000} className="input mt-1 min-h-24" placeholder="State the claim as precisely as you can, with dates and places." />
          </label>
          <label><span className="label">Topic context (optional)</span>
            <select name="topic" className="input mt-1">
              <option value="">None</option>
              {topics.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}
            </select>
          </label>
          <div><button className="btn-primary">Start research</button></div>
        </form>
      ) : (
        <p className="mt-6 panel p-5 text-sm">AI research is disabled. Set <code>ANTHROPIC_API_KEY</code> to enable it.</p>
      )}
      <table className="mt-10 w-full text-left text-sm">
        <thead><tr className="label"><th className="py-2">Claim</th><th>Status</th><th>By</th><th>Started</th></tr></thead>
        <tbody className="divide-y divide-line">
          {jobs.map((j) => (
            <tr key={j.id}>
              <td className="py-2 pr-4"><Link href={`/admin/research/${j.id}`}>{j.input.slice(0, 100)}</Link></td>
              <td className="font-mono text-xs">{j.status}</td>
              <td className="text-muted">{j.createdBy.email}</td>
              <td className="text-muted">{formatDate(j.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
