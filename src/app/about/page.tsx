import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Funding & governance" };

export default function AboutPage() {
  const org = process.env.ORG_NAME ?? "VerdictBoard";
  const funding = process.env.FUNDING_DISCLOSURE;
  return (
    <div className="mx-auto max-w-4xl px-4 pb-12 pt-14 sm:px-6">
      <span className="eyebrow">Disclosure</span>
      <h1 className="h-display mt-4 text-[44px] sm:text-6xl">Funding &amp; governance</h1>

      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">Who runs this</h2>
        <p className="mt-4 max-w-prose text-ink/85">{org} is an independent project. The ownership, legal entity and editorial leadership are listed here and updated whenever they change.</p>
      </section>

      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">Funding</h2>
        <p className="mt-4 max-w-prose text-ink/85">
          {funding ?? "We accept no political advertising and no funding from governments, political parties, campaigns or armed groups. Every funder contributing more than 5% of annual income will be named here. Funding does not buy editorial influence, and funders see dossiers only when the public does."}
        </p>
      </section>

      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">Editorial governance</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink/85">
          <li>Roles: reviewers handle challenges; editors draft and publish; administrators manage accounts. No one may publish a claim they drafted.</li>
          <li>Staff and reviewers disclose relevant political affiliations and conflicts, and recuse themselves from affected dossiers.</li>
          <li>We are establishing an independent advisory board, with members from differing political perspectives, to review methodology and appeals. Members will be listed here once appointed.</li>
          <li>Every editorial action is written to an internal, append-only audit log; material changes appear in the public corrections log.</li>
        </ul>
      </section>

      <section id="api" className="card mt-6 p-6 sm:p-8 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">Open data API</h2>
        <p className="mt-4 max-w-prose text-ink/85">Basic evidence and corrections are never paywalled. All published dossiers are available as JSON under CC BY 4.0:</p>
        <ul className="mt-3 space-y-1 font-mono text-sm">
          <li>GET <Link href="/api/public/claims" prefetch={false}>/api/public/claims</Link> — index of claims and labels</li>
          <li>GET /api/public/claims/&#123;slug&#125; — full evidence record with sources, provenance and corrections</li>
        </ul>
        <p className="mt-3 text-sm text-muted">Vote data is not included in the API, to protect users and limit manipulation incentives.</p>
      </section>

      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">Privacy</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink/85">
          <li>We store your email to sign you in. It is never shown publicly or used in analytics.</li>
          <li>Rate-limit records use keyed hashes of IP addresses and are deleted after two days.</li>
          <li>You can delete your account and votes at any time from your account page.</li>
          <li>Subgroup results are shown only above a minimum size and never identify individuals.</li>
        </ul>
      </section>
    </div>
  );
}
