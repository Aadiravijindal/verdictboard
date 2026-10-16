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
  DOCUMENTED: { label: "Documented", cls: "text-agreed" },
  DETAILS_DISPUTED: { label: "Details disputed", cls: "text-disputed" },
  INTERPRETATION: { label: "Interpretation", cls: "text-unverified" },
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

  if (!events.length) return <p className="text-muted">No timeline events have been published for this topic yet.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4 border border-line bg-panel p-4">
        <label className="block">
          <span className="label">Start reading from</span>
          <select className="input mt-1 w-40" value={start} onChange={(e) => setStart(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={keyOnly} onChange={(e) => setKeyOnly(e.target.checked)} className="accent-[#B8F36B]" />
          Key events only
        </label>
        <p className="label ml-auto">{shown.length} of {events.length} events shown</p>
      </div>

      {before.length > 0 && (
        <div role="note" className="mt-4 border-l-2 border-disputed bg-panel p-4 text-sm">
          <p>
            <strong>Earlier context is excluded from this view.</strong> {before.length} earlier event{before.length === 1 ? "" : "s"}
            {keyBefore.length ? `, including ${keyBefore.length} that editors mark as essential context (${keyBefore.slice(0, 3).map((e) => e.title).join("; ")}${keyBefore.length > 3 ? "…" : ""})` : ""}, occurred before {start}.
          </p>
          <button type="button" className="mt-2 font-mono text-xs uppercase tracking-[0.12em] text-accent underline" onClick={() => setStart(years[0])}>
            Show the full timeline from {years[0]}
          </button>
        </div>
      )}

      <ol className="relative mt-6 border-l border-line pl-6">
        {shown.map((e) => (
          <li key={e.id} id={e.id} className="mb-8">
            <span className={`absolute -left-[5px] mt-2 h-2.5 w-2.5 ${e.keyEvent ? "bg-accent" : "border border-muted bg-canvas"}`} aria-hidden="true" />
            <p className="label">
              <time dateTime={e.date}>{e.dateLabel}</time>
              <span className={`ml-3 ${CERTAINTY[e.certainty].cls}`}>{CERTAINTY[e.certainty].label}</span>
              {e.keyEvent && <span className="ml-3 text-accent">Key context</span>}
            </p>
            <h3 className="mt-1 text-lg font-semibold">{e.title}</h3>
            <p className="mt-1 max-w-prose text-ink/85">{e.description}</p>
            {e.disputeNote && <p className="mt-2 max-w-prose text-sm text-disputed">What is disputed: {e.disputeNote}</p>}
            {e.sources.length > 0 ? (
              <p className="mt-2 text-sm text-muted">
                Sources:{" "}
                {e.sources.map((s, i) => (
                  <span key={s.slug}>
                    {i > 0 && " · "}
                    <a href={`/sources/${s.slug}`}>{s.publisher}</a>
                  </span>
                ))}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">No source linked yet for this event — <a href="#report">suggest one</a>.</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
