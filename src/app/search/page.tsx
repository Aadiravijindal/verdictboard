import Link from "next/link";
import type { Metadata } from "next";
import { searchPublished } from "@/lib/queries";
import { ClaimCard } from "@/components/ClaimCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").slice(0, 200);
  const { claims, topics, sources } = await searchPublished(q);
  const none = q && !claims.length && !topics.length && !sources.length;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="h-display text-6xl">Search</h1>
      <form className="mt-6 flex max-w-2xl gap-2" role="search">
        <label htmlFor="q" className="sr-only">Search</label>
        <input id="q" name="q" defaultValue={q} className="input" placeholder="Claim, event, court, institution…" />
        <button className="btn-primary">Search</button>
      </form>
      {none && (
        <div className="mt-8 max-w-2xl panel p-5">
          <p>No dossiers match &ldquo;{q}&rdquo; yet.</p>
          <p className="mt-2 text-sm text-muted">Paste the claim into the <Link href={`/decompose?text=${encodeURIComponent(q)}`}>claim checker</Link> to break it into testable questions, or suggest it for investigation.</p>
        </div>
      )}
      {topics.length > 0 && (
        <section className="mt-10">
          <h2 className="label">Topics</h2>
          <ul className="mt-3 space-y-2">{topics.map((t) => <li key={t.id}><Link href={`/topics/${t.slug}`} className="text-lg">{t.title}</Link></li>)}</ul>
        </section>
      )}
      {claims.length > 0 && (
        <section className="mt-10">
          <h2 className="label">Claims</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">{claims.map((c) => <ClaimCard key={c.id} claim={c} topic={c.topic} />)}</div>
        </section>
      )}
      {sources.length > 0 && (
        <section className="mt-10">
          <h2 className="label">Sources</h2>
          <ul className="mt-3 space-y-2">{sources.map((s) => <li key={s.id}><Link href={`/sources/${s.slug}`}>{s.title}</Link> <span className="text-sm text-muted">— {s.publisher}</span></li>)}</ul>
        </section>
      )}
    </div>
  );
}
