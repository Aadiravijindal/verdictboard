import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { EvidenceRelation } from "@prisma/client";
import { getClaim } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { resultsForViewer, viewerVotes } from "@/lib/votes";
import {
  KIND_LABEL, KIND_PROMPT, RELATION_LABEL, SOURCE_TYPE_LABEL, STATUS_DESCRIPTION, VARIANT_LABEL,
  asStringArray, asVariants, formatDate,
} from "@/lib/labels";
import { StatusBadge } from "@/components/StatusBadge";
import { VoteWidget } from "@/components/VoteWidget";
import { ResultsPanel } from "@/components/ResultsPanel";
import { SourceGraph } from "@/components/SourceGraph";
import { ReportForm } from "@/components/ReportForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const claim = await getClaim((await params).slug);
  return claim ? { title: claim.headline, description: claim.proposition } : {};
}

const RELATION_ORDER: EvidenceRelation[] = ["SUPPORTS", "PARTIALLY_SUPPORTS", "CONTRADICTS", "CONTEXT"];
const RELATION_HEADING: Record<EvidenceRelation, string> = {
  SUPPORTS: "Evidence supporting the claim",
  PARTIALLY_SUPPORTS: "Evidence partly supporting the claim",
  CONTRADICTS: "Evidence challenging the claim",
  CONTEXT: "Context and responses",
};

function List({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <p className="text-sm text-muted">{empty}</p>;
  return <ul className="list-disc space-y-2 pl-5 marker:text-accent">{items.map((i) => <li key={i} className="max-w-prose">{i}</li>)}</ul>;
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-8">
      <h2 className="label mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default async function ClaimPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [claim, user] = await Promise.all([getClaim(slug), getCurrentUser()]);
  if (!claim) notFound();

  const mine = user ? await viewerVotes(user.id, claim.id) : [];
  const before = mine.find((v) => v.phase === "BEFORE") ?? null;
  const after = mine.find((v) => v.phase === "AFTER") ?? null;
  const results = await resultsForViewer(claim.id, user?.id ?? null);
  const loginHref = `/login?next=${encodeURIComponent(`/claims/${claim.slug}`)}`;
  const prompts = KIND_PROMPT[claim.kind];
  const variants = asVariants(claim.variants);

  return (
    <article className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <nav className="label" aria-label="Breadcrumb">
        <Link href="/topics">Topics</Link> / <Link href={`/topics/${claim.topic.slug}`}>{claim.topic.title}</Link> / {claim.code}
      </nav>

      <header className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="label text-accent">Dossier / {claim.code.replace("CLM-", "")} · {KIND_LABEL[claim.kind]}</p>
          <h1 className="h-display mt-3 text-5xl sm:text-7xl">{claim.headline}</h1>
          <div className="mt-6 border-l-2 border-accent pl-4">
            <p className="label">The exact proposition assessed</p>
            <p className="mt-1 text-xl leading-snug sm:text-2xl">{claim.proposition}</p>
          </div>
        </div>
        <aside className="panel h-fit p-5">
          <p className="label">Evidence assessment (Layer A)</p>
          <div className="mt-3"><StatusBadge status={claim.status} reason={claim.reason} size="lg" /></div>
          <p className="mt-3 text-sm text-ink/90">{claim.statusRationale}</p>
          <p className="mt-3 text-xs text-muted">{STATUS_DESCRIPTION[claim.status]}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="label">Reviewed</dt><dd>{formatDate(claim.lastReviewedAt)}</dd></div>
            <div><dt className="label">Version</dt><dd>v{claim.version}{claim.corrections.length ? ` · ${claim.corrections.length} correction${claim.corrections.length > 1 ? "s" : ""}` : ""}</dd></div>
            <div><dt className="label">Sources</dt><dd>{claim.evidence.length}</dd></div>
            <div><dt className="label">AI-assisted</dt><dd>{claim.aiAssisted ? "Yes — human reviewed" : "No"}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-muted">Votes never change this assessment. <Link href="/methodology#labels">How labels are assigned</Link></p>
        </aside>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          {!before && !after && (
            <section className="corner p-5" aria-labelledby="first-impression">
              <h2 id="first-impression" className="label text-accent">Before you read — first impression (optional)</h2>
              <p className="mt-2 text-sm text-muted">
                Record your view now and again after reading. Comparing the two powers the evidence-impact meter. You can skip this.
              </p>
              <div className="mt-4">
                <VoteWidget claimSlug={claim.slug} phase="BEFORE" prompts={prompts} existing={null} signedIn={!!user} loginHref={loginHref} />
              </div>
            </section>
          )}

          <Section id="scope" title="Scope">
            <p className="max-w-prose">{claim.scope}</p>
            <p className="mt-4 max-w-prose text-ink/85">{claim.summary}</p>
          </Section>

          <Section id="questions" title="The questions this claim depends on">
            <ol className="list-decimal space-y-2 pl-5 marker:font-mono marker:text-muted">
              {asStringArray(claim.decomposition).map((q) => <li key={q} className="max-w-prose">{q}</li>)}
            </ol>
          </Section>

          <Section id="established" title="What the records establish">
            <List items={asStringArray(claim.established)} empty="Nothing has been established to the required standard yet." />
          </Section>

          <Section id="contested" title="What remains contested">
            <List items={asStringArray(claim.contested)} empty="No material dispute about this proposition has been identified. Disagree? Submit counterevidence below." />
          </Section>

          <Section id="counter" title="Strongest counterevidence and limitations">
            <List items={asStringArray(claim.counterevidence)} empty="No credible counterevidence has been identified. We do not manufacture an opposing case." />
          </Section>

          <Section id="missing" title="What evidence is missing">
            <List items={asStringArray(claim.missingEvidence)} empty="No material gaps identified." />
            <p className="mt-3 text-xs text-muted">Missing evidence is not disproof — and absence of corroboration is not confirmation.</p>
          </Section>

          {variants.length > 0 && (
            <Section id="variants" title="Viral versions of this claim">
              <ul className="space-y-3">
                {variants.map((v) => (
                  <li key={v.text} className="panel p-4">
                    <p className="font-semibold">&ldquo;{v.text}&rdquo;</p>
                    <p className="label mt-2 text-disputed">{VARIANT_LABEL[v.assessment] ?? v.assessment}</p>
                    <p className="mt-1 text-sm text-ink/85">{v.explanation}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section id="evidence" title="Evidence, with provenance">
            <div className="space-y-8">
              {RELATION_ORDER.filter((r) => claim.evidence.some((e) => e.relation === r)).map((r) => (
                <div key={r}>
                  <h3 className="text-lg font-semibold">{RELATION_HEADING[r]}</h3>
                  <ul className="mt-3 space-y-3">
                    {claim.evidence.filter((e) => e.relation === r).map((e) => (
                      <li key={e.id} className="panel p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="label">{RELATION_LABEL[e.relation]}</span>
                          <span className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${e.source.isPrimary ? "border-accent text-accent" : "border-line text-muted"}`}>
                            {e.source.isPrimary ? "Primary" : "Secondary"}
                          </span>
                          <span className="label">{SOURCE_TYPE_LABEL[e.source.sourceType]}</span>
                          {e.aiGenerated && <span className="label text-unverified">AI-drafted · editor approved</span>}
                        </div>
                        <p className="mt-2 font-semibold">
                          <Link href={`/sources/${e.source.slug}`}>{e.source.title}</Link>
                        </p>
                        <p className="text-sm text-muted">{e.source.publisher}{e.source.author ? ` · ${e.source.author}` : ""} · {formatDate(e.source.publishedAt)}</p>
                        <p className="mt-3 max-w-prose">{e.establishes}</p>
                        {e.quote && (
                          <blockquote className="mt-3 border-l-2 border-line pl-3 text-sm italic text-ink/85">
                            &ldquo;{e.quote}&rdquo;{e.quoteVerified && <span className="not-italic text-muted"> (matched to retrieved source text)</span>}
                          </blockquote>
                        )}
                        {e.locator && <p className="label mt-2">Location: {e.locator}</p>}
                        {e.source.limitations && <p className="mt-2 text-sm text-disputed">Limitations: {e.source.limitations}</p>}
                        {e.source.derivedFrom && (
                          <p className="mt-2 text-sm text-muted">Repeats: <Link href={`/sources/${e.source.derivedFrom.slug}`}>{e.source.derivedFrom.title}</Link> — not independent confirmation.</p>
                        )}
                        <a href={e.source.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-mono text-xs uppercase tracking-[0.12em] text-accent">Open original ↗</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section id="graph" title="Source graph">
            <SourceGraph items={claim.evidence} claimCode={claim.code} />
          </Section>

          <Section id="assess" title="Your assessment (Layer C)">
            <p className="mb-4 max-w-prose text-sm text-muted">
              After reviewing the evidence, how would you assess this specific proposition? Aggregate results are hidden until you vote.
              {claim.kind !== "VALUE" && " This poll asks about the evidence — not whether an action was justified."}
            </p>
            <VoteWidget
              claimSlug={claim.slug}
              phase="AFTER"
              prompts={prompts}
              existing={after ? { stance: after.stance, confidence: after.confidence } : null}
              signedIn={!!user}
              loginHref={loginHref}
            />
            {results && <div className="mt-8"><ResultsPanel r={results} /></div>}
          </Section>

          <Section id="corrections" title="Corrections and editorial history">
            {claim.corrections.length === 0 ? (
              <p className="text-sm text-muted">No corrections since publication on {formatDate(claim.publishedAt)}.</p>
            ) : (
              <ol className="space-y-3">
                {claim.corrections.map((c) => (
                  <li key={c.id} className="panel p-4 text-sm">
                    <p className="label">{formatDate(c.createdAt)} · {c.field}</p>
                    <p className="mt-1 font-semibold">{c.summary}</p>
                    <p className="mt-1 text-muted">Reason: {c.reason}</p>
                    {c.before !== null && <p className="mt-1 font-mono text-xs text-muted">Before: {JSON.stringify(c.before)} → After: {JSON.stringify(c.after)}</p>}
                  </li>
                ))}
              </ol>
            )}
          </Section>

          <Section id="report" title="Challenge this dossier">
            <ReportForm claimId={claim.id} signedIn={!!user} />
          </Section>
        </div>

        <aside className="hidden lg:block">
          <nav className="sticky top-24 panel p-4" aria-label="Dossier sections">
            <p className="label">In this dossier</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {[["scope", "Scope"], ["questions", "Questions"], ["established", "Established"], ["contested", "Contested"], ["counter", "Counterevidence"], ["missing", "Missing evidence"], ...(variants.length ? [["variants", "Viral versions"]] : []), ["evidence", "Evidence"], ["graph", "Source graph"], ["assess", "Your assessment"], ["corrections", "Corrections"], ["report", "Challenge"]].map(([id, l]) => (
                <li key={id}><a href={`#${id}`} className="no-underline hover:text-accent">{l}</a></li>
              ))}
            </ul>
            <a href={`/api/public/claims/${claim.slug}`} className="btn-ghost mt-5 w-full justify-center">Download record (JSON)</a>
          </nav>
        </aside>
      </div>
    </article>
  );
}
