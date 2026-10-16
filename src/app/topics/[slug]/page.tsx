import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTopic, getTopics } from "@/lib/queries";
import { asStringArray, formatDate } from "@/lib/labels";
import { ClaimCard } from "@/components/ClaimCard";
import { Timeline, type TimelineEvent } from "@/components/Timeline";
import { ReportForm } from "@/components/ReportForm";
import { TopicGlyph, tileGradient } from "@/components/Tiles";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const topic = await getTopic((await params).slug);
  return topic ? { title: topic.title, description: topic.summary } : {};
}

function SectionTitle({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <div>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="h-display mt-4 text-3xl sm:text-4xl">{title}</h2>
      {lede && <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">{lede}</p>}
    </div>
  );
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [topic, user, all] = await Promise.all([getTopic(slug), getCurrentUser(), getTopics()]);
  if (!topic) notFound();
  const idx = all.findIndex((t) => t.id === topic.id);

  const events: TimelineEvent[] = topic.events.map((e) => ({
    id: e.slug,
    date: e.date.toISOString().slice(0, 10),
    dateLabel: formatDate(e.date, e.datePrecision),
    year: e.date.getUTCFullYear(),
    title: e.title,
    description: e.description,
    certainty: e.certainty,
    disputeNote: e.disputeNote,
    keyEvent: e.keyEvent,
    sources: e.sources.map((s) => ({ slug: s.source.slug, title: s.source.title, publisher: s.source.publisher })),
  }));

  return (
    <>
      <section className="relative overflow-hidden text-white" style={{ background: tileGradient(Math.max(idx, 0)) }}>
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
          <nav aria-label="Breadcrumb" className="text-sm text-white/60"><Link href="/topics" className="no-underline hover:text-white">Topics</Link> / {topic.code}</nav>
          <div className="mt-8 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur"><TopicGlyph category={topic.category} /></span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-[13px] font-semibold backdrop-blur">{topic.kicker} · {topic.region}</span>
          </div>
          <h1 className="h-display mt-6 max-w-4xl text-[48px] sm:text-7xl">{topic.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/75">{topic.overview}</p>
          <div className="mt-10 grid max-w-3xl grid-cols-3 gap-3">
            {[[topic.claims.length, "Dossiers", "#claims"], [topic.events.length, "Timeline events", "#timeline"], [topic.perspectives.length, "Perspectives", "#perspectives"]].map(([n, l, href]) => (
              <a key={l as string} href={href as string} className="glass p-4 text-white no-underline transition-colors hover:bg-white/10">
                <p className="font-display text-3xl font-bold">{n}</p>
                <p className="text-sm text-white/65">{l}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="card -mt-8 relative flex flex-col gap-2 p-6 sm:flex-row sm:items-start sm:gap-8">
          <p className="shrink-0 text-sm font-semibold">Editorial scope</p>
          <p className="text-[15px] leading-relaxed text-muted">{topic.scope} <span className="whitespace-nowrap">Last reviewed {formatDate(topic.lastReviewedAt)}.</span></p>
        </div>

        <section id="claims" className="scroll-mt-24 pt-20">
          <SectionTitle eyebrow="Claim dossiers" title="The specific claims, one by one." lede="Each dossier assesses one precisely worded proposition — never a whole conflict, party or person." />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {topic.claims.map((c) => <ClaimCard key={c.id} claim={c} />)}
          </div>
        </section>

        <section id="timeline" className="scroll-mt-24 pt-24">
          <SectionTitle eyebrow="Timeline" title="Context before conclusions." lede="Start reading wherever you like. Earlier events are never removed — they stay counted and one tap away." />
          <div className="mt-8"><Timeline events={events} /></div>
        </section>

        <section id="perspectives" className="scroll-mt-24 pt-24">
          <SectionTitle eyebrow="Perspectives" title="How each side reads the facts." lede="Interpretations held by identifiable actors, with their strongest arguments and the strongest replies. Listing a view is not endorsing it." />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {topic.perspectives.map((p) => (
              <article key={p.id} className="card p-7">
                <p className="text-[13px] font-medium text-muted">Held by {p.heldBy}</p>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-[-0.02em]">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{p.summary}</p>
                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl bg-surface p-4">
                    <p className="text-sm font-semibold">Strongest arguments</p>
                    <ul className="mt-2 space-y-1.5 text-[15px] text-ink/80">{asStringArray(p.arguments).map((a) => <li key={a} className="flex gap-2"><span className="text-agreed">+</span>{a}</li>)}</ul>
                  </div>
                  <div className="rounded-2xl bg-surface p-4">
                    <p className="text-sm font-semibold">Strongest replies</p>
                    <ul className="mt-2 space-y-1.5 text-[15px] text-ink/80">{asStringArray(p.counterarguments).map((a) => <li key={a} className="flex gap-2"><span className="text-disputed">−</span>{a}</li>)}</ul>
                  </div>
                </div>
                {p.sources.length > 0 && (
                  <p className="mt-4 text-[13px] text-muted">
                    Sources: {p.sources.map((s, i) => <span key={s.sourceId}>{i > 0 && " · "}<a href={`/sources/${s.source.slug}`}>{s.source.publisher}</a></span>)}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section id="report" className="scroll-mt-24 pt-24">
          <div className="grid gap-8 rounded-[36px] bg-surface p-8 sm:p-12 lg:grid-cols-[1fr_1.2fr]">
            <SectionTitle eyebrow="Help improve this" title="Missing an event or a source?" lede="Submissions are reviewed against published rules, whichever government, party or group they concern." />
            <div className="card p-6"><ReportForm signedIn={!!user} /></div>
          </div>
        </section>
      </div>
    </>
  );
}
