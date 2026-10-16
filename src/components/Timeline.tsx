"use client";

import { useMemo, useState } from "react";

export interface TimelineEvent {
  id: string;
  date: string;
  dateLabel: string;
  year: number;
  title: string;
  description: string;
  certainty: "DOCUMENTED" | "DETAILS_DISPUTED" | "INTERPRETATION";
  disputeNote: string | null;
  keyEvent: boolean;
  sources: { slug: string; title: string; publisher: string }[];
}

const CERTAINTY: Record<TimelineEvent["certainty"], { label: string; cls: string }> = {
  DOCUMENTED: { label: "Documented", cls: "bg-agreed-soft text-agreed" },
  DETAILS_DISPUTED: { label: "Details disputed", cls: "bg-disputed-soft text-disputed" },
  INTERPRETATION: { label: "Interpretation", cls: "bg-unverified-soft text-unverified" },
};

/**
 * Users may choose where to start reading; the choice never hides the record.
 * Excluded earlier events are always counted and one click away.
 */
export function Timeline({ events }: { events: TimelineEvent[] }) {
  const years = useMemo(() => [...new Set(events.map((e) => e.year))].sort((a, b) => a - b), [events]);
  const [start, setStart] = useState<number>(years[0] ?? 0);
  const [keyOnly, setKeyOnly] = useState(false);

  const before = events.filter((e) => e.year < start);
  const shown = events.filter((e) => e.year >= start && (!keyOnly || e.keyEvent));
  const keyBefore = before.filter((e) => e.keyEvent);

  if (!events.length) return <p className="soft p-6 text-muted">No timeline events have been published for this topic yet.</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <label className="block">
            <span className="text-sm font-semibold">Start reading from</span>
            <select className="input mt-2" value={start} onChange={(e) => setStart(Number(e.target.value))}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <div className="mt-4 flex rounded-full bg-surface p-1 text-sm font-semibold" role="group" aria-label="Filter events">
            <button type="button" aria-pressed={!keyOnly} onClick={() => setKeyOnly(false)} className={`flex-1 rounded-full py-2 transition-colors ${!keyOnly ? "bg-white shadow-card" : "text-muted"}`}>All events</button>
            <button type="button" aria-pressed={keyOnly} onClick={() => setKeyOnly(true)} className={`flex-1 rounded-full py-2 transition-colors ${keyOnly ? "bg-white shadow-card" : "text-muted"}`}>Key only</button>
          </div>
          <p className="mt-4 text-sm text-muted">{shown.length} of {events.length} events shown</p>
        </div>
        {before.length > 0 && (
          <div role="note" className="mt-4 rounded-xl2 bg-disputed-soft p-5 text-sm text-ink">
            <p className="font-semibold">Earlier context is excluded from this view</p>
            <p className="mt-1 text-ink/75">
              {before.length} earlier event{before.length === 1 ? "" : "s"} happened before {start}
              {keyBefore.length ? `, including ${keyBefore.length} marked as essential context (${keyBefore.slice(0, 2).map((e) => e.title).join("; ")}${keyBefore.length > 2 ? "…" : ""})` : ""}.
            </p>
            <button type="button" className="mt-3 font-semibold text-accent" onClick={() => setStart(years[0])}>Show everything from {years[0]} →</button>
          </div>
        )}
      </div>

      <ol className="relative space-y-4 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-line">
        {shown.map((e) => (
          <li key={e.id} id={e.id} className="relative flex gap-5 scroll-mt-24">
            <span className={`relative z-10 mt-6 grid h-10 w-10 shrink-0 place-items-center rounded-full ring-4 ring-white ${e.keyEvent ? "bg-ink text-white" : "bg-surface text-muted"}`} aria-hidden="true">
              <span className={`h-2.5 w-2.5 rounded-full ${e.keyEvent ? "bg-white" : "bg-muted/60"}`} />
            </span>
            <div className="card flex-1 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <time dateTime={e.date} className="text-sm font-semibold">{e.dateLabel}</time>
                <span className={`chip ${CERTAINTY[e.certainty].cls}`}>{CERTAINTY[e.certainty].label}</span>
                {e.keyEvent && <span className="chip bg-ink text-white">Key context</span>}
              </div>
              <h3 className="mt-3 font-display text-xl font-bold tracking-[-0.02em]">{e.title}</h3>
              <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-ink/80">{e.description}</p>
              {e.disputeNote && <p className="mt-3 rounded-2xl bg-disputed-soft px-4 py-3 text-sm text-ink/80"><strong className="text-disputed">What&apos;s disputed:</strong> {e.disputeNote}</p>}
              <p className="mt-3 text-[13px] text-muted">
                {e.sources.length > 0 ? (
                  <>Sources: {e.sources.map((s, i) => <span key={s.slug}>{i > 0 && " · "}<a href={`/sources/${s.slug}`}>{s.publisher}</a></span>)}</>
                ) : (
                  <>No source linked yet — <a href="#report">suggest one</a>.</>
                )}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
