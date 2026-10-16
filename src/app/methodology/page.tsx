import type { Metadata } from "next";
import Link from "next/link";
import { REASON_LABEL, STATUS_DESCRIPTION, STATUS_LABEL } from "@/lib/labels";
import { ALLOWED_REASONS } from "@/lib/content-validate";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Methodology", description: "How VerdictBoard assesses claims, handles sources, corrections and votes." };

const RULES: [string, string][] = [
  ["Separate truth from popularity", "Every claim has an evidence assessment separate from its poll results. Votes describe users' beliefs, not factual accuracy, and are never read when a label is set."],
  ["Use the same standard for every actor", "Governments, opposition parties, militaries, armed groups, companies and activists face the same source requirements. Weak evidence is not excused because a conclusion is convenient."],
  ["Show the strongest relevant counterevidence", "We present the strongest credible evidence for and against a claim. We do not manufacture symmetry when the evidence overwhelmingly supports one conclusion."],
  ["Make source provenance visible", "Every source shows who produced it, when, whether it is primary or secondary, what it directly establishes and its limitations. Reports that repeat an original are linked to it and not counted as independent confirmation."],
  ["Preserve the history of corrections", "If a label, reason, proposition or scope changes, the change is logged publicly with what changed, when and why. Dossiers are never silently rewritten."],
  ["Disclose conflicts of interest", "Ownership, funding, governance and material conflicts are published on our funding page. Funding does not buy editorial influence."],
  ["Do not confuse missing evidence with disproof", "If evidence is unavailable, we say so. 'Unverified' means insufficient evidence — not false."],
  ["Allow independent scrutiny", "Anyone signed in can challenge sources, submit counterevidence or appeal a decision. The rules for accepting and rejecting challenges are published below. All dossiers are downloadable as open data."],
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="label">Methodology v1.0</p>
      <h1 className="h-display mt-2 text-6xl sm:text-7xl">How we work</h1>
      <p className="mt-4 max-w-prose text-lg text-ink/85">
        Fairness means equal standards, not equal credibility. A neutral design cannot rescue a biased editorial process, so the process itself is what we publish.
      </p>

      <section className="mt-12">
        <h2 className="label border-b border-line pb-2">Three layers, never confused</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="panel p-4"><dt className="font-semibold">A — What the evidence establishes</dt><dd className="mt-1 text-sm text-muted">Records, rulings, data, verified footage and independently corroborated facts.</dd></div>
          <div className="panel p-4"><dt className="font-semibold">B — What those facts mean</dt><dd className="mt-1 text-sm text-muted">Competing historical, causal and legal interpretations with their reasoning shown.</dd></div>
          <div className="panel p-4"><dt className="font-semibold">C — What people believe</dt><dd className="mt-1 text-sm text-muted">Votes and confidence from participating users. A 90% vote does not make a false claim true.</dd></div>
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="label border-b border-line pb-2">The eight non-negotiable rules</h2>
        <ol className="mt-4 space-y-5">
          {RULES.map(([t, d], i) => (
            <li key={t} className="grid gap-2 sm:grid-cols-[60px_1fr]">
              <span className="h-display text-4xl text-accent">{String(i + 1).padStart(2, "0")}</span>
              <div><p className="font-semibold">{t}</p><p className="mt-1 text-ink/80">{d}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section id="labels" className="mt-12 scroll-mt-24">
        <h2 className="label border-b border-line pb-2">Labels and the reasons behind them</h2>
        <p className="mt-4 max-w-prose text-ink/85">
          A label applies to one precisely worded proposition, within a stated scope — never to a whole conflict, party or person. Each label must be justified by one of a fixed set of reasons; the system rejects combinations that do not fit.
        </p>
        <div className="mt-4 grid gap-4">
          {(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((s) => (
            <div key={s} className="panel p-4">
              <p className="font-semibold">{STATUS_LABEL[s]}</p>
              <p className="mt-1 text-sm text-ink/80">{STATUS_DESCRIPTION[s]}</p>
              <p className="label mt-2">Permitted reasons: {ALLOWED_REASONS[s].map((r) => REASON_LABEL[r]).join(" · ")}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-prose text-sm text-muted">
          &ldquo;Widely agreed — contradicted by evidence&rdquo; means the evidence clearly refutes the proposition as worded. We prefer to word dossiers around the accurate proposition and list misleading viral versions separately, so a label is never mistaken for an endorsement of the viral claim.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="label border-b border-line pb-2">Legal questions</h2>
        <p className="mt-4 max-w-prose text-ink/85">
          We distinguish binding judgments, provisional orders, advisory opinions, arrest warrants, indictments, commission-of-inquiry findings, government determinations and advocacy organisations&apos; legal arguments. None of the last six is presented as a final legal finding of guilt or liability. Where the competent court has not decided, the claim is labelled &ldquo;Disputed — legal question unresolved&rdquo;.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="label border-b border-line pb-2">Sources</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink/85">
          <li>Primary records first: court records, legislation, official records and data, reports of investigating bodies.</li>
          <li>Independent original reporting next; interested-party statements are labelled as such.</li>
          <li>Casualty and statistical figures show their source, date, geographical scope, definition and uncertainty.</li>
          <li>Source links are checked automatically on a schedule; broken links are replaced with archived copies where lawful.</li>
        </ul>
      </section>

      <section id="challenges" className="mt-12 scroll-mt-24">
        <h2 className="label border-b border-line pb-2">How challenges are decided</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-ink/85">
          <li>Every submission is logged and reviewed by an editor who did not write the dossier, whichever party, state or group it concerns.</li>
          <li>A challenge is <strong>accepted</strong> when it identifies a source we misrepresent, a material factual error, a stronger primary source, credible counterevidence we omitted, or a change in the record (for example a new judgment).</li>
          <li>A challenge is <strong>rejected</strong> when it offers no verifiable evidence, relies only on popularity or volume of submissions, or disputes a value judgement the dossier does not make. Rejections state the reason.</li>
          <li>Accepted challenges that change a label, reason, proposition or scope generate a public correction.</li>
          <li>Coordinated mass submissions are treated as one submission.</li>
        </ol>
      </section>

      <section id="votes" className="mt-12 scroll-mt-24">
        <h2 className="label border-b border-line pb-2">Votes</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink/85">
          <li>Factual, causal, responsibility, legal and value questions never share a poll.</li>
          <li>Results are hidden until you vote. One current vote per verified account, claim and phase, enforced by the database; changes are allowed and recorded.</li>
          <li>We show the number of votes, the date range, 95% intervals and the share of &ldquo;Unsure&rdquo;. Intervals describe this sample only; users are self-selected.</li>
          <li>Results from accounts older than 7 days are shown separately so mobilisation by new accounts is visible. Nothing is silently weighted.</li>
          <li>Country and political leaning are optional, self-reported and never inferred. Groups smaller than {env.minSubgroupSize} are hidden.</li>
          <li>The evidence-impact meter compares votes before and after reading. It is observational and does not prove that the dossier caused any change.</li>
          <li>Email verification is a baseline, not proof of one human per vote. We use rate limits and abuse monitoring and do not promise perfect fraud prevention.</li>
        </ul>
      </section>

      <p className="mt-12 text-sm text-muted">See also: <Link href="/ai-policy">How we use AI</Link> · <Link href="/corrections">Corrections log</Link> · <Link href="/about">Funding &amp; governance</Link></p>
    </div>
  );
}
