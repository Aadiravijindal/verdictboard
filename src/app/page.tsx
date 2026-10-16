import Link from "next/link";
import { getTopics, published } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { PixelIcon } from "@/components/Icons";
import { ClaimCard } from "@/components/ClaimCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const topics = await getTopics();
  const [claimCount, sourceCount, featured] = await Promise.all([
    prisma.claim.count({ where: published }),
    prisma.source.count(),
    prisma.claim.findMany({
      where: { ...published, slug: { in: ["icj-january-2024-order", "evm-tampering-changed-results", "covid-lab-leak", "tariffs-paid-by-americans"] } },
      include: { topic: true },
    }),
  ]);

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:pt-20">
          <div>
            <p className="label text-accent">Open investigations / {String(topics.length).padStart(3, "0")}</p>
            <h1 className="h-display mt-4 text-[52px] sm:text-[84px] lg:text-[112px]">
              Don&apos;t take the claim.
              <br />
              <span className="text-accent">Trace the evidence.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink/85">
              Political claims. Primary sources. Competing perspectives. Your assessment — kept separate from what the evidence establishes.
            </p>
            <form action="/search" className="mt-8 flex max-w-xl gap-2" role="search">
              <label htmlFor="q" className="sr-only">Search claims, events or institutions</label>
              <input id="q" name="q" className="input" placeholder="Search a claim, event or public institution…" />
              <button className="btn-primary" type="submit">
                <PixelIcon name="search" size={12} /> Search
              </button>
            </form>
          </div>
          <aside className="corner self-end p-6">
            <p className="label">The record so far</p>
            <dl className="mt-4 grid grid-cols-3 gap-4">
              <div><dt className="label">Topics</dt><dd className="h-display text-5xl">{topics.length}</dd></div>
              <div><dt className="label">Claims</dt><dd className="h-display text-5xl">{claimCount}</dd></div>
              <div><dt className="label">Sources</dt><dd className="h-display text-5xl">{sourceCount}</dd></div>
            </dl>
            <p className="mt-4 text-sm text-muted">Every claim links to its sources. Every change is logged in public.</p>
            <Link href="/decompose" className="btn-ghost mt-5">
              <PixelIcon name="spark" size={12} /> Paste a viral claim
            </Link>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="label">Explore by topic</h2>
          <Link href="/topics" className="label hover:text-accent">View all ↗</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((t, i) => (
            <Link
              key={t.id}
              href={`/topics/${t.slug}`}
              className={`group border border-line bg-panel p-6 no-underline transition-colors hover:border-accent ${i % 3 === 1 ? "lg:translate-y-6" : ""}`}
            >
              <p className="label">{`// Topic ${String(i + 1).padStart(2, "0")} // ${t.kicker}`}</p>
              <h3 className="h-display mt-3 text-4xl text-ink group-hover:text-accent">{t.title}</h3>
              <p className="mt-3 text-sm text-muted">{t.summary}</p>
              <p className="label mt-5">{t._count.claims} claims · {t._count.events} events · {t.region}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="label">How it works / 03 steps</h2>
          <ol className="mt-8 grid gap-10 md:grid-cols-3">
            {[
              ["01", "Find the claim", "Start with a specific statement, not a political team. Paste a viral claim and we break it into testable questions."],
              ["02", "Inspect the sources", "Follow original documents, independent reporting and counterevidence. See when ten articles repeat one source."],
              ["03", "Make your assessment", "Vote after reviewing the evidence. Compare views — without confusing popularity with fact."],
            ].map(([n, t, d]) => (
              <li key={n}>
                <span className="h-display text-6xl text-accent">{n}</span>
                <h3 className="mt-2 text-xl font-semibold">{t}</h3>
                <p className="mt-2 text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="label">Frequently misread</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {featured.map((c) => (
            <ClaimCard key={c.id} claim={c} topic={c.topic} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 border border-line p-6 md:grid-cols-3">
          {[
            ["A", "What the evidence establishes", "Records, rulings, data and corroborated facts — with provenance."],
            ["B", "What the facts mean", "Competing interpretations and legal analyses, with their reasoning shown."],
            ["C", "What people believe", "Votes and confidence from participating users. Never used to set a label."],
          ].map(([k, t, d]) => (
            <div key={k}>
              <p className="label">Layer {k}</p>
              <p className="mt-2 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
