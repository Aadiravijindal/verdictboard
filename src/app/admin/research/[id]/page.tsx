import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import type { ResearchResult } from "@/lib/ai/research";
import { REASON_LABEL, RELATION_LABEL, SOURCE_TYPE_LABEL, STATUS_LABEL } from "@/lib/labels";
import { acceptResearch, discardResearch, retryResearch } from "../../actions";
import { ErrorBanner } from "@/components/ErrorBanner";
import { AutoRefresh } from "@/components/AutoRefresh";

export default async function ResearchJobPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const job = await prisma.researchJob.findUnique({ where: { id }, include: { createdBy: true, claim: true } });
  if (!job) notFound();
  const topics = await prisma.topic.findMany({ orderBy: { sortOrder: "asc" } });
  const out = job.output as unknown as ResearchResult | null;

  return (
    <div>
      <ErrorBanner error={error} />
      <Link href="/admin/research" className="label">← Research desk</Link>
      <h1 className="mt-2 text-2xl font-semibold">{job.input}</h1>
      <p className="label mt-2">{job.status} · {job.model} · by {job.createdBy.email}</p>

      {(job.status === "QUEUED" || job.status === "RUNNING") && (
        <div className="mt-6 panel p-5">
          <p>Research in progress. This page refreshes automatically.</p>
          <AutoRefresh seconds={10} />
          <form action={retryResearch} className="mt-3"><input type="hidden" name="jobId" value={job.id} /><button className="btn-ghost">Restart if stuck</button></form>
        </div>
      )}
      {job.status === "FAILED" && (
        <div className="mt-6 rounded-xl2 bg-[#FDECEA] p-5">
          <p className="text-danger">Failed: {job.error}</p>
          <form action={retryResearch} className="mt-3"><input type="hidden" name="jobId" value={job.id} /><button className="btn-ghost">Retry</button></form>
        </div>
      )}
      {job.claim && <p className="mt-6">Accepted as draft: <Link href={`/admin/claims/${job.claim.id}`}>{job.claim.code} — {job.claim.headline}</Link></p>}

      {out && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form action={acceptResearch} className="space-y-6">
            <input type="hidden" name="jobId" value={job.id} />
            <div className="panel p-5">
              <p className="label">Proposed proposition</p>
              <p className="mt-1 text-lg">{out.draft.proposition}</p>
              <p className="label mt-3">Suggested label (AI — not authoritative)</p>
              <p>{STATUS_LABEL[out.draft.suggestedStatus]} · {REASON_LABEL[out.draft.suggestedReason]}</p>
              <p className="mt-2 text-sm text-ink/85">{out.draft.statusRationale}</p>
            </div>
            {out.draft.reviewerWarnings.length > 0 && (
              <div className="border border-disputed p-4 text-sm">
                <p className="label text-disputed">Reviewer warnings</p>
                <ul className="mt-2 list-disc pl-5">{out.draft.reviewerWarnings.map((w) => <li key={w}>{w}</li>)}</ul>
              </div>
            )}
            <div>
              <p className="label">Evidence — select what to keep. Each item will still need individual approval.</p>
              <ul className="mt-3 space-y-3">
                {out.draft.evidence.map((e, i) => {
                  const check = out.checks[i];
                  const src = out.draft.sources.find((s) => s.url === e.url);
                  return (
                    <li key={i} className="panel p-4 text-sm">
                      <label className="flex gap-3">
                        <input type="checkbox" name="evidence" value={i} defaultChecked={check?.urlSeen} className="mt-1 accent-[#0666EB]" />
                        <span>
                          <span className="label">{RELATION_LABEL[e.relation]} · {src ? `${SOURCE_TYPE_LABEL[src.sourceType]} · ${src.isPrimary ? "primary" : "secondary"}` : "source missing from list"}</span>
                          <span className="mt-1 block font-semibold">{src?.title ?? e.url}</span>
                          <a href={e.url} target="_blank" rel="noopener noreferrer" className="break-all text-xs">{e.url}</a>
                          <span className="mt-2 block">{e.establishes}</span>
                          {e.quote && <span className="mt-2 block border-l-2 border-line pl-2 italic">&ldquo;{e.quote}&rdquo;</span>}
                          <span className="mt-2 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.12em]">
                            <span className={check?.urlSeen ? "text-agreed" : "text-danger"}>{check?.urlSeen ? "URL retrieved" : "URL not retrieved"}</span>
                            {e.quote && <span className={check?.quoteVerified ? "text-agreed" : "text-disputed"}>{check?.quoteVerified ? "Quote matched" : "Quote not matched"}</span>}
                            {src?.repeatsUrl && <span className="text-muted">Repeats another source</span>}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
            {job.status === "NEEDS_REVIEW" && (
              <div className="flex flex-wrap items-end gap-3 panel p-4">
                <label><span className="label">File under topic</span>
                  <select name="topic" required className="input mt-1 w-72" defaultValue={job.topicSlug ?? ""}>
                    <option value="" disabled>Choose…</option>
                    {topics.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}
                  </select>
                </label>
                <button className="btn-primary">Create draft claim</button>
              </div>
            )}
          </form>
          <aside className="space-y-4">
            {job.status === "NEEDS_REVIEW" && (
              <form action={discardResearch}><input type="hidden" name="jobId" value={job.id} /><button className="btn-ghost w-full justify-center">Discard</button></form>
            )}
            <div className="panel p-4 text-sm">
              <p className="label">Usage</p>
              <p className="mt-1">{out.usage.searches} searches · {out.usage.fetches} fetches · {out.usage.inputTokens.toLocaleString()} in / {out.usage.outputTokens.toLocaleString()} out tokens</p>
            </div>
            <details className="panel p-4 text-sm">
              <summary className="label cursor-pointer">Research memo</summary>
              <pre className="mt-3 max-h-[600px] overflow-auto whitespace-pre-wrap font-sans text-xs text-ink/85">{out.memo}</pre>
            </details>
            <details className="panel p-4 text-sm">
              <summary className="label cursor-pointer">Retrieved URLs ({out.retrievedUrls.length})</summary>
              <ul className="mt-3 space-y-1 break-all text-xs text-muted">{out.retrievedUrls.map((u) => <li key={u}>{u}</li>)}</ul>
            </details>
          </aside>
        </div>
      )}
    </div>
  );
}
