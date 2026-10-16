import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTopic } from "@/lib/queries";
import { asStringArray, formatDate } from "@/lib/labels";
import { ClaimCard } from "@/components/ClaimCard";
import { Timeline, type TimelineEvent } from "@/components/Timeline";
import { ReportForm } from "@/components/ReportForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const topic = await getTopic((await params).slug);
  return topic ? { title: topic.title, description: topic.summary } : {};
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [topic, user] = await Promise.all([getTopic(slug), getCurrentUser()]);
  if (!topic) notFound();

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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <nav className="label" aria-label="Breadcrumb"><Link href="/topics">Topics</Link> / {topic.code}</nav>
      <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="label text-accent">{topic.kicker} · {topic.region}</p>
          <h1 className="h-display mt-2 text-6xl sm:text-8xl">{topic.title}</h1>
          <div className="prose-vb mt-6"><p>{topic.overview}</p></div>
        </div>
        <aside className="panel h-fit p-5 text-sm">
          <p className="label">Editorial scope</p>
          <p className="mt-2 text-ink/85">{topic.scope}</p>
          <p className="label mt-4">Last reviewed</p>
          <p className="mt-1">{formatDate(topic.lastReviewedAt)}</p>
          <ul className="mt-4 space-y-1 font-mono text-xs uppercase tracking-[0.12em]">
            <li><a href="#claims">→ Claim dossiers ({topic.claims.length})</a></li>
            <li><a href="#timeline">→ Timeline ({topic.events.length})</a></li>
            <li><a href="#perspectives">→ Perspectives ({topic.perspectives.length})</a></li>
          </ul>
        </aside>
      </div>

      <section id="claims" className="mt-16 scroll-mt-24">
        <h2 className="label border-b border-line pb-2">Claim dossiers</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {topic.claims.map((c) => (
            <ClaimCard key={c.id} claim={c} />
          ))}
        </div>
      </section>

      <section id="timeline" className="mt-16 scroll-mt-24">
        <h2 className="label border-b border-line pb-2">Timeline explorer</h2>
        <p className="mt-4 max-w-prose text-sm text-muted">
          Choose where to start reading. Your choice never removes events from the record — earlier context stays counted and one click away.
        </p>
        <div className="mt-6"><Timeline events={events} /></div>
      </section>

      <section id="perspectives" className="mt-16 scroll-mt-24">
        <h2 className="label border-b border-line pb-2">Documented perspectives (Layer B)</h2>
        <p className="mt-4 max-w-prose text-sm text-muted">
          Interpretations held by identifiable actors, with their strongest arguments and the strongest responses to them. Listing a perspective is not an endorsement.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {topic.perspectives.map((p) => (
            <article key={p.id} className="panel p-5">
              <h3 className="text-xl font-semibold">{p.title}</h3>
              <p className="label mt-1">Held by: {p.heldBy}</p>
              <p className="mt-3 text-ink/85">{p.summary}</p>
              <p className="label mt-4">Strongest arguments</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{asStringArray(p.arguments).map((a) => <li key={a}>{a}</li>)}</ul>
              <p className="label mt-4">Strongest responses</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted">{asStringArray(p.counterarguments).map((a) => <li key={a}>{a}</li>)}</ul>
              {p.sources.length > 0 && (
                <p className="mt-4 text-xs text-muted">
                  Sources: {p.sources.map((s, i) => <span key={s.sourceId}>{i > 0 && " · "}<a href={`/sources/${s.source.slug}`}>{s.source.publisher}</a></span>)}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section id="report" className="mt-16 max-w-2xl scroll-mt-24">
        <h2 className="label border-b border-line pb-2">Missing an event or a source?</h2>
        <div className="mt-4"><ReportForm signedIn={!!user} /></div>
      </section>
    </div>
  );
}
