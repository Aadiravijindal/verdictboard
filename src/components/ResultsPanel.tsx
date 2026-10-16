import type { Breakdown, ClaimResults } from "@/lib/votes";
import { STANCE_LABEL, formatDate } from "@/lib/labels";

const BAR: Record<string, string> = { AGREE: "bg-ink", DISAGREE: "bg-muted", UNSURE: "bg-line" };

function pct(x: number) {
  return `${Math.round(x * 100)}%`;
}

function Bars({ b }: { b: Breakdown }) {
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden border border-line" role="img" aria-label={b.shares.map((s) => `${STANCE_LABEL[s.stance]} ${pct(s.share)}`).join(", ")}>
        {b.shares.map((s) => <div key={s.stance} className={BAR[s.stance]} style={{ width: `${s.share * 100}%` }} />)}
      </div>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
        {b.shares.map((s) => (
          <div key={s.stance}>
            <dt className="label">{STANCE_LABEL[s.stance]}</dt>
            <dd className="font-mono">{pct(s.share)} <span className="text-xs text-muted">({pct(s.low)}–{pct(s.high)})</span></dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ResultsPanel({ r }: { r: ClaimResults }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="label text-accent">What participating users believe</p>
        <p className="mt-1 text-sm text-muted">
          Not what the public believes, and not evidence. Users are self-selected and may be mobilised by campaigns. Bars use neutral greys — the colour of a result never signals a side.
        </p>
      </div>
      {r.all.n === 0 ? (
        <p className="text-sm text-muted">No post-evidence assessments yet.</p>
      ) : (
        <>
          <div>
            <p className="label">All verified accounts · n = {r.all.n}</p>
            <div className="mt-2"><Bars b={r.all} /></div>
            <p className="mt-2 text-xs text-muted">
              Mean confidence {Math.round(r.all.meanConfidence ?? 0)}%. Votes from {formatDate(r.firstVoteAt)} to {formatDate(r.lastVoteAt)}. Ranges are 95% intervals for this sample only; they do not correct for self-selection.
            </p>
          </div>
          <div>
            <p className="label">Accounts older than 7 days at time of vote · n = {r.establishedAccounts.n}</p>
            <div className="mt-2"><Bars b={r.establishedAccounts} /></div>
            <p className="mt-2 text-xs text-muted">Shown separately so sudden waves of new accounts are visible. Nothing is silently re-weighted.</p>
          </div>
        </>
      )}
      {r.impact ? (
        <div className="border border-line p-4">
          <p className="label">Evidence-impact meter · {r.impact.pairedN} users voted before and after reading</p>
          <p className="mt-2">
            <span className="h-display text-4xl">{pct(r.impact.changedShare)}</span> changed their answer after reviewing the dossier
            <span className="text-sm text-muted"> ({pct(r.impact.changedLow)}–{pct(r.impact.changedHigh)})</span>.
          </p>
          <p className="mt-1 text-sm text-muted">
            Mean confidence {Math.round(r.impact.meanConfidenceBefore)}% before → {Math.round(r.impact.meanConfidenceAfter)}% after. Observational only: this does not show that the dossier caused the change.
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted">The evidence-impact meter appears once at least {r.minSubgroupSize} users have voted both before and after reading.</p>
      )}
      {(r.byCountry.length > 0 || r.byLeaning.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {[["By self-reported country", r.byCountry], ["By self-reported political leaning", r.byLeaning]].map(([title, groups]) => (
            <div key={title as string}>
              <p className="label">{title as string}</p>
              <ul className="mt-2 space-y-3">
                {(groups as ClaimResults["byCountry"]).map((g) => (
                  <li key={g.label}>
                    <p className="text-sm">{g.label} <span className="text-muted">· n = {g.n}</span></p>
                    <Bars b={g} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted">
        Groups with fewer than {r.minSubgroupSize} respondents are hidden to protect privacy and avoid misleading comparisons{r.suppressedGroups ? ` (${r.suppressedGroups} hidden)` : ""}. Country and leaning are optional and never inferred.
      </p>
    </div>
  );
}
