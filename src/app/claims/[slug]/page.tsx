import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { EvidenceRelation } from "@prisma/client";
import { getClaim } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { resultsForViewer, viewerVotes } from "@/lib/votes";
import {
  KIND_LABEL, KIND_PROMPT, SOURCE_TYPE_LABEL, STATUS_DESCRIPTION, VARIANT_LABEL,
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
  SUPPORTS: "Supporting evidence",
  PARTIALLY_SUPPORTS: "Partly supporting evidence",
  CONTRADICTS: "Challenging evidence",
  CONTEXT: "Context and responses",
};
const RELATION_DOT: Record<EvidenceRelation, string> = {
  SUPPORTS: "bg-agreed",
  PARTIALLY_SUPPORTS: "bg-[#7BA05B]",
  CONTRADICTS: "bg-disputed",
  CONTEXT: "bg-unverified",
};
const VARIANT_CHIP: Record<string, string> = {
  CONTRADICTED: "bg-[#FDECEA] text-danger",
  MISLEADING: "bg-disputed-soft text-disputed",
  OVERSTATED: "bg-disputed-soft text-disputed",
  UNSUPPORTED: "bg-unverified-soft text-unverified",
  ACCURATE: "bg-agreed-soft text-agreed",
};

function Bullets({ items, empty, tone = "ink" }: { items: string[]; empty: string; tone?: "ink" | "agreed" | "disputed" | "muted" }) {
  if (!items.length) return <p className="text-[15px] text-muted">{empty}</p>;
  const dot = { ink: "bg-ink", agreed: "bg-agreed", disputed: "bg-disputed", muted: "bg-muted" }[tone];
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i} className="flex gap-3 text-[16px] leading-relaxed text-ink/85">
          <span className={`mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
          <span className="max-w-prose">{i}</span>
        </li>
      ))}
    </ul>
  );
}

function Block({ id, title, children, className = "" }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`card scroll-mt-24 p-6 sm:p-8 ${className}`}>
      <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">{title}</h2>
      <div className="mt-5">{children}</div>
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
  const primary = claim.evidence.filter((e) => e.source.isPrimary).length;

  const nav: [string, string][] = [
    ["established", "What's established"], ["contested", "What's contested"], ["counter", "Counterevidence"],
    ...(variants.length ? [["variants", "Viral versions"] as [string, string]] : []),
    ["evidence", "Evidence"], ["graph", "Source graph"], ["assess", "Your assessment"], ["corrections", "History"], ["report", "Challenge"],
  ];

  return (
    <article>
      <header className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <Link href="/topics" className="no-underline hover:text-ink">Topics</Link><span>/</span>
            <Link href={`/topics/${claim.topic.slug}`} className="no-underline hover:text-ink">{claim.topic.title}</Link><span>/</span>
            <span className="font-mono text-xs">{claim.code}</span>
          </nav>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
            <div>
              <span className="eyebrow">{KIND_LABEL[claim.kind]}</span>
              <h1 className="h-display mt-5 text-[40px] sm:text-6xl">{claim.headline}</h1>
              <div className="mt-8 rounded-xl3 bg-white p-6 shadow-card ring-1 ring-line/70">
                <p className="text-sm font-semibold text-muted">The exact proposition assessed</p>
                <p className="mt-2 font-display text-xl font-semibold leading-snug tracking-[-0.015em] sm:text-2xl">{claim.proposition}</p>
              </div>
            </div>

            <aside className="rounded-xl3 bg-ink p-7 text-white shadow-lift lg:self-start">
              <p className="text-sm font-medium text-white/60">Evidence assessment</p>
              <div className="mt-3"><StatusBadge status={claim.status} size="lg" /></div>
              <p className="mt-4 text-[15px] leading-relaxed text-white/85">{claim.statusRationale}</p>
              <p className="mt-3 text-[13px] leading-relaxed text-white/50">{STATUS_DESCRIPTION[claim.status]}</p>
              <dl className="mt-6 grid grid-cols-2 gap-3">
                {[
                  ["Sources", String(claim.evidence.length)],
                  ["Primary", String(primary)],
                  ["Version", `v${claim.version}`],
                  ["Reviewed", formatDate(claim.lastReviewedAt)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-white/[0.07] p-3">
                    <dt className="text-xs text-white/50">{k}</dt>
                    <dd className="mt-0.5 font-display text-lg font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
              {claim.aiAssisted && <p className="mt-4 text-[13px] text-white/60">AI-assisted research · human reviewed and second-editor approved</p>}
              <p className="mt-5 text-[13px] text-white/50">Votes never change this assessment. <Link href="/methodology#labels" className="text-white/80">How labels work</Link></p>
            </aside>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-10 grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0 space-y-6">
          {!before && !after && (
            <section className="scroll-mt-24 rounded-xl3 bg-accent-soft p-6 sm:p-8" aria-labelledby="first-impression">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="first-impression" className="font-display text-xl font-bold tracking-[-0.02em]">Before you read — what&apos;s your first impression?</h2>
                <span className="text-sm text-muted">Optional</span>
              </div>
              <p className="mt-2 text-[15px] text-ink/70">Answer now and again after reading — the difference powers the evidence-impact meter.</p>
              <div className="mt-5">
                <VoteWidget claimSlug={claim.slug} phase="BEFORE" prompts={prompts} existing={null} signedIn={!!user} loginHref={loginHref} compact />
              </div>
            </section>
          )}

          <section className="grid gap-6 md:grid-cols-[1fr_1fr]">
            <div className="card p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-muted">In short</h2>
              <p className="mt-3 text-[17px] leading-relaxed">{claim.summary}</p>
              <p className="mt-5 text-sm font-semibold text-muted">Scope</p>
              <p className="mt-1 text-[15px] leading-relaxed text-ink/80">{claim.scope}</p>
            </div>
            <div className="card p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-muted">The questions this depends on</h2>
              <ol className="mt-4 space-y-3">
                {asStringArray(claim.decomposition).map((q, i) => (
                  <li key={q} className="flex gap-3 text-[15px] leading-relaxed">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface text-xs font-bold">{i + 1}</span>
                    {q}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <Block id="established" title="What the records establish">
            <Bullets items={asStringArray(claim.established)} empty="Nothing has been established to the required standard yet." tone="agreed" />
          </Block>

          <div className="grid gap-6 md:grid-cols-2">
            <Block id="contested" title="What's contested">
              <Bullets items={asStringArray(claim.contested)} empty="No material dispute identified. Disagree? Submit counterevidence below." tone="disputed" />
            </Block>
            <Block id="counter" title="Strongest counterevidence">
              <Bullets items={asStringArray(claim.counterevidence)} empty="No credible counterevidence identified. We don't manufacture an opposing case." tone="muted" />
            </Block>
          </div>

          <Block id="missing" title="What's missing">
            <Bullets items={asStringArray(claim.missingEvidence)} empty="No material gaps identified." tone="muted" />
            <p className="mt-5 rounded-2xl bg-surface px-4 py-3 text-sm text-muted">Missing evidence isn&apos;t disproof — and a lack of corroboration isn&apos;t confirmation.</p>
          </Block>

          {variants.length > 0 && (
            <Block id="variants" title="Viral versions of this claim">
              <ul className="grid gap-3">
                {variants.map((v) => (
                  <li key={v.text} className="rounded-2xl bg-surface p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="font-semibold">&ldquo;{v.text}&rdquo;</p>
                      <span className={`chip ${VARIANT_CHIP[v.assessment] ?? "bg-white text-ink"}`}>{VARIANT_LABEL[v.assessment] ?? v.assessment}</span>
                    </div>
                    <p className="mt-2 text-[15px] text-ink/75">{v.explanation}</p>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          <Block id="evidence" title="Evidence, with provenance">
            <div className="space-y-8">
              {RELATION_ORDER.filter((r) => claim.evidence.some((e) => e.relation === r)).map((r) => (
                <div key={r}>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-muted"><span className={`h-2 w-2 rounded-full ${RELATION_DOT[r]}`} />{RELATION_HEADING[r]}</h3>
                  <ul className="mt-3 space-y-3">
                    {claim.evidence.filter((e) => e.relation === r).map((e) => (
                      <li key={e.id} className="rounded-2xl border border-line p-5 transition-colors hover:border-ink/20">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`chip ${e.source.isPrimary ? "bg-accent-soft text-accent" : "bg-surface text-muted"}`}>{e.source.isPrimary ? "Primary" : "Secondary"}</span>
                          <span className="chip bg-surface text-muted">{SOURCE_TYPE_LABEL[e.source.sourceType]}</span>
                          {e.aiGenerated && <span className="chip bg-unverified-soft text-unverified">AI-drafted · approved</span>}
                        </div>
                        <p className="mt-3 font-display text-lg font-bold leading-snug tracking-[-0.015em]">
                          <Link href={`/sources/${e.source.slug}`} className="no-underline hover:underline">{e.source.title}</Link>
                        </p>
                        <p className="mt-0.5 text-[13px] text-muted">{e.source.publisher}{e.source.author ? ` · ${e.source.author}` : ""} · {formatDate(e.source.publishedAt)}</p>
                        <p className="mt-3 text-[15px] leading-relaxed text-ink/85">{e.establishes}</p>
                        {e.quote && (
                          <blockquote className="mt-3 rounded-2xl bg-surface px-4 py-3 text-[15px] italic text-ink/80">
                            &ldquo;{e.quote}&rdquo;{e.quoteVerified && <span className="not-italic text-muted"> · matched to source text</span>}
                          </blockquote>
                        )}
                        {e.locator && <p className="mt-2 text-[13px] text-muted">Location: {e.locator}</p>}
                        {e.source.limitations && <p className="mt-3 rounded-2xl bg-disputed-soft px-4 py-3 text-sm text-ink/80"><strong className="text-disputed">Limitations:</strong> {e.source.limitations}</p>}
                        {e.source.derivedFrom && (
                          <p className="mt-2 text-sm text-muted">Repeats <Link href={`/sources/${e.source.derivedFrom.slug}`}>{e.source.derivedFrom.title}</Link> — not independent confirmation.</p>
                        )}
                        <a href={e.source.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline">Open original ↗</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Block>

          <Block id="graph" title="Source graph">
            <SourceGraph items={claim.evidence} claimCode={claim.code} />
          </Block>

          <section id="assess" className="scroll-mt-24 rounded-xl3 bg-ink p-6 text-white sm:p-10">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[13px] font-semibold">Your assessment</span>
            <h2 className="h-display mt-4 text-3xl sm:text-4xl">Having seen the evidence, where do you land?</h2>
            <p className="mt-3 max-w-2xl text-[15px] text-white/60">
              Results unlock after you vote.{claim.kind !== "VALUE" && " This asks about the evidence — not whether anything was justified."}
            </p>
            <div className="mt-8">
              <VoteWidget
                claimSlug={claim.slug}
                phase="AFTER"
                prompts={prompts}
                existing={after ? { stance: after.stance, confidence: after.confidence } : null}
                signedIn={!!user}
                loginHref={loginHref}
                dark
              />
            </div>
            {results && <div className="mt-10 rounded-xl3 bg-white p-6 text-ink sm:p-8"><ResultsPanel r={results} /></div>}
          </section>

          <Block id="corrections" title="Corrections & history">
            {claim.corrections.length === 0 ? (
              <p className="text-[15px] text-muted">No corrections since publication on {formatDate(claim.publishedAt)}.</p>
            ) : (
              <ol className="space-y-3">
                {claim.corrections.map((c) => (
                  <li key={c.id} className="rounded-2xl bg-surface p-5 text-sm">
                    <p className="text-muted">{formatDate(c.createdAt)} · {c.field}</p>
                    <p className="mt-1 font-semibold">{c.summary}</p>
                    <p className="mt-1 text-ink/75">Why: {c.reason}</p>
                    {c.before !== null && <p className="mt-2 break-words font-mono text-xs text-muted">{JSON.stringify(c.before)} → {JSON.stringify(c.after)}</p>}
                  </li>
                ))}
              </ol>
            )}
          </Block>

          <Block id="report" title="Challenge this dossier">
            <ReportForm claimId={claim.id} signedIn={!!user} />
          </Block>
        </div>

        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-4" aria-label="Dossier sections">
            <div className="card p-4">
              <p className="px-2 text-sm font-semibold">On this page</p>
              <ul className="mt-2 space-y-0.5">
                {nav.map(([id, l]) => (
                  <li key={id}><a href={`#${id}`} className="block rounded-xl px-2 py-1.5 text-[14px] text-muted no-underline hover:bg-surface hover:text-ink">{l}</a></li>
                ))}
              </ul>
            </div>
            <Link href={`/api/public/claims/${claim.slug}`} prefetch={false} className="btn-ghost w-full no-underline">Download record</Link>
          </nav>
        </aside>
      </div>
    </article>
  );
}
