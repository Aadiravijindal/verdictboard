import type { Metadata } from "next";

export const metadata: Metadata = { title: "How we use AI" };

const USES: [string, string, string][] = [
  ["Claim checker (public)", "Breaks a pasted claim into precise sub-questions, the evidence that would answer them and loaded terms. Points to existing dossiers.", "Makes no factual assertions and assigns no label. Output is clearly marked as AI-generated."],
  ["Research desk (editors only)", "Searches the web for primary records and original reporting, opens them, extracts exact passages, flags repeated reporting and drafts a dossier with a suggested label.", "Drafts are never published automatically. Every evidence link starts unapproved."],
  ["Grounding checks (automatic)", "Checks that each AI-cited URL was actually retrieved during research, and that each quoted passage appears in the retrieved text.", "Unmatched quotes block publication until an editor verifies or removes them."],
];

export default function AiPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-12 pt-14 sm:px-6">
      <span className="eyebrow">Policy</span>
      <h1 className="h-display mt-4 text-[44px] sm:text-6xl">How we use AI</h1>
      <p className="mt-4 max-w-prose text-lg text-ink/85">
        AI does the tedious collection, extraction, deduplication and cross-referencing. Humans approve every conclusion. An AI-generated summary never silently becomes a verified fact.
      </p>
      <div className="card mt-10 overflow-x-auto p-2">
        <table className="w-full min-w-[640px] text-left text-[15px]">
          <thead><tr><th className="p-3 label">Where</th><th className="p-3 label">What it does</th><th className="p-3 label">Safeguard</th></tr></thead>
          <tbody className="divide-y divide-line">
            {USES.map(([w, d, s]) => <tr key={w}><td className="p-3 font-semibold">{w}</td><td className="p-3">{d}</td><td className="p-3 text-muted">{s}</td></tr>)}
          </tbody>
        </table>
      </div>
      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">The publication gate</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-ink/85">
          <li>An editor reviews the AI draft, selects which evidence to keep and edits the wording.</li>
          <li>Each evidence link must be individually approved; quotes that could not be matched to retrieved text must be checked by hand or removed.</li>
          <li>The editor submits the claim for review. A different editor must publish it.</li>
          <li>Published dossiers drafted with AI assistance are marked &ldquo;AI-assisted — human reviewed&rdquo;, and each AI-drafted evidence item is labelled.</li>
          <li>High-impact conclusions, legal classifications and historical characterisations always receive full human review.</li>
        </ol>
      </section>
      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">What AI never does here</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink/85">
          <li>Assign or change a published label.</li>
          <li>Infer your political leaning, country or identity.</li>
          <li>Moderate or reject your challenges on its own.</li>
          <li>Generate images, footage or quotes presented as evidence.</li>
        </ul>
      </section>
      <p className="mt-10 text-sm text-muted">Model provider: Anthropic (Claude). Inputs to the claim checker are sent to the provider for processing and are not used by VerdictBoard to profile users.</p>
    </div>
  );
}
