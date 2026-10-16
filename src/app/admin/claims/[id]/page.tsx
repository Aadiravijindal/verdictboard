import Link from "next/link";
import { notFound } from "next/navigation";
import type { ClaimKind, ClaimStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { KIND_LABEL, REASON_LABEL, RELATION_LABEL, STATUS_LABEL, asStringArray } from "@/lib/labels";
import { ALLOWED_REASONS } from "@/lib/content-validate";
import { publicationBlockers } from "@/lib/research-jobs";
import { saveClaim, setEvidence, transitionClaim } from "../../actions";
import { ErrorBanner } from "@/components/ErrorBanner";

function Field({ name, label, value, rows = 3 }: { name: string; label: string; value: string; rows?: number }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea name={name} defaultValue={value} rows={rows} className="input mt-1" />
    </label>
  );
}

export default async function EditClaim({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, { error }, me] = await Promise.all([params, searchParams, getCurrentUser()]);
  const claim = await prisma.claim.findUnique({
    where: { id },
    include: { topic: true, evidence: { include: { source: true }, orderBy: { sortOrder: "asc" } }, reports: { where: { status: "OPEN" } }, corrections: { orderBy: { createdAt: "desc" } } },
  });
  if (!claim || !me) notFound();
  const drafter = claim.draftedById ? await prisma.user.findUnique({ where: { id: claim.draftedById }, select: { email: true } }) : null;
  const blockers = claim.publishStatus === "IN_REVIEW" ? await publicationBlockers(claim.id, me) : [];
  const allReasons = Object.keys(REASON_LABEL) as (keyof typeof REASON_LABEL)[];

  return (
    <div>
      <ErrorBanner error={error} />
      <Link href="/admin/claims" className="label">← Claims</Link>
      <h1 className="mt-2 text-2xl font-semibold">{claim.code} — {claim.headline}</h1>
      <p className="label mt-1">{claim.publishStatus} · v{claim.version} · {claim.topic.title} · drafted by {drafter?.email ?? "content repository"}</p>
      {claim.publishStatus === "PUBLISHED" && <p className="mt-2 text-sm"><Link href={`/claims/${claim.slug}`}>View public dossier ↗</Link></p>}

      <section className="mt-6 flex flex-wrap items-start gap-3 panel p-4">
        {claim.publishStatus === "DRAFT" && (
          <form action={transitionClaim}><input type="hidden" name="id" value={claim.id} /><input type="hidden" name="to" value="IN_REVIEW" /><button className="btn-primary">Submit for second review</button></form>
        )}
        {claim.publishStatus === "IN_REVIEW" && (
          <>
            <form action={transitionClaim}><input type="hidden" name="id" value={claim.id} /><input type="hidden" name="to" value="PUBLISHED" /><button className="btn-primary" disabled={blockers.length > 0}>Publish</button></form>
            <form action={transitionClaim}><input type="hidden" name="id" value={claim.id} /><input type="hidden" name="to" value="DRAFT" /><button className="btn-ghost">Return to draft</button></form>
          </>
        )}
        {claim.publishStatus !== "ARCHIVED" && (
          <form action={transitionClaim} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={claim.id} /><input type="hidden" name="to" value="ARCHIVED" />
            {claim.publishStatus === "PUBLISHED" && <input name="reason" className="input w-72" placeholder="Public reason for withdrawal" />}
            <button className="btn-ghost border-danger text-danger">Archive</button>
          </form>
        )}
        {blockers.length > 0 && (
          <ul className="w-full list-disc pl-5 text-sm text-disputed">{blockers.map((b) => <li key={b}>{b}</li>)}</ul>
        )}
      </section>

      <form action={saveClaim} className="mt-8 grid gap-4">
        <input type="hidden" name="id" value={claim.id} />
        <div className="grid gap-4 sm:grid-cols-3">
          <label><span className="label">Label</span>
            <select name="status" defaultValue={claim.status} className="input mt-1">
              {(Object.keys(STATUS_LABEL) as ClaimStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </label>
          <label><span className="label">Reason</span>
            <select name="reason" defaultValue={claim.reason} className="input mt-1">
              {allReasons.map((r) => <option key={r} value={r}>{REASON_LABEL[r]}</option>)}
            </select>
          </label>
          <label><span className="label">Question type</span>
            <select name="kind" defaultValue={claim.kind} className="input mt-1">
              {(Object.keys(KIND_LABEL) as ClaimKind[]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
            </select>
          </label>
        </div>
        <p className="text-xs text-muted">Permitted: {(Object.keys(ALLOWED_REASONS) as ClaimStatus[]).map((s) => `${STATUS_LABEL[s]} → ${ALLOWED_REASONS[s].map((r) => REASON_LABEL[r]).join(", ")}`).join(" | ")}</p>
        <label className="block"><span className="label">Headline</span><input name="headline" defaultValue={claim.headline} className="input mt-1" /></label>
        <Field name="proposition" label="Exact proposition" value={claim.proposition} />
        <Field name="statusRationale" label="Rationale for label" value={claim.statusRationale} />
        <Field name="scope" label="Scope" value={claim.scope} />
        <Field name="summary" label="Summary" value={claim.summary} />
        <Field name="decomposition" label="Sub-questions (one per line)" value={asStringArray(claim.decomposition).join("\n")} rows={5} />
        <Field name="established" label="What records establish (one per line)" value={asStringArray(claim.established).join("\n")} rows={5} />
        <Field name="contested" label="What remains contested (one per line)" value={asStringArray(claim.contested).join("\n")} rows={4} />
        <Field name="counterevidence" label="Counterevidence and limitations (one per line)" value={asStringArray(claim.counterevidence).join("\n")} rows={4} />
        <Field name="missingEvidence" label="Missing evidence (one per line)" value={asStringArray(claim.missingEvidence).join("\n")} rows={3} />
        {claim.publishStatus === "PUBLISHED" && (
          <label className="block border border-disputed p-3"><span className="label text-disputed">Public correction reason (required if you change label, reason, proposition, scope or rationale)</span>
            <input name="correctionReason" className="input mt-1" />
          </label>
        )}
        <div><button className="btn-primary">Save changes</button></div>
      </form>

      <section className="mt-10">
        <h2 className="label">Evidence links</h2>
        <ul className="mt-3 space-y-3">
          {claim.evidence.map((e) => (
            <li key={e.id} className={`panel p-4 text-sm ${e.approved ? "" : "border-disputed"}`}>
              <p className="label">{RELATION_LABEL[e.relation]} · {e.approved ? "approved" : "awaiting approval"}{e.aiGenerated ? " · AI-drafted" : ""}</p>
              <p className="mt-1 font-semibold"><a href={e.source.url} target="_blank" rel="noopener noreferrer">{e.source.title}</a></p>
              <p className="text-muted">{e.source.publisher}</p>
              <p className="mt-2">{e.establishes}</p>
              {e.quote && <p className="mt-2 border-l-2 border-line pl-2 italic">&ldquo;{e.quote}&rdquo; <span className={`not-italic ${e.quoteVerified ? "text-agreed" : "text-disputed"}`}>({e.quoteVerified ? "verified" : "not verified"})</span></p>}
              {e.reviewerNote && <p className="mt-2 text-disputed">{e.reviewerNote}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  !e.approved && ["approve", "Approve"],
                  e.approved && ["unapprove", "Unapprove"],
                  e.quote && !e.quoteVerified && ["verifyQuote", "I checked the quote"],
                  e.quote && ["removeQuote", "Remove quote"],
                  ["delete", "Delete"],
                ].filter(Boolean).map((x) => {
                  const [op, label] = x as [string, string];
                  return (
                    <form key={op} action={setEvidence}>
                      <input type="hidden" name="evidenceId" value={e.id} /><input type="hidden" name="claimId" value={claim.id} /><input type="hidden" name="op" value={op} />
                      <button className={op === "delete" ? "btn-ghost border-danger text-danger" : "btn-ghost"}>{label}</button>
                    </form>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {claim.reports.length > 0 && <p className="mt-8"><Link href="/admin/reports">{claim.reports.length} open challenge(s) on this claim →</Link></p>}
    </div>
  );
}
