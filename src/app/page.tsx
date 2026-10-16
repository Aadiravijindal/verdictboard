import Link from "next/link";
import { getTopics, published } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { ClaimCard } from "@/components/ClaimCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TopicGlyph, tileGradient } from "@/components/Tiles";
import { REASON_LABEL, SOURCE_TYPE_LABEL } from "@/lib/labels";

export const dynamic = "force-dynamic";

const FEATURED = ["icj-january-2024-order", "evm-tampering-changed-results", "covid-lab-leak", "tariffs-paid-by-americans"];

export default async function Home() {
  const topics = await getTopics();
  const [claimCount, sourceCount, primaryCount, featured, hero] = await Promise.all([
    prisma.claim.count({ where: published }),
    prisma.source.count(),
    prisma.source.count({ where: { isPrimary: true } }),
    prisma.claim.findMany({ where: { ...published, slug: { in: FEATURED } }, include: { topic: true } }),
    prisma.claim.findFirst({
      where: { ...published, slug: "icj-january-2024-order" },
      include: { evidence: { where: { approved: true }, include: { source: true }, orderBy: { sortOrder: "asc" }, take: 3 } },
    }),
  ]);
  featured.sort((a, b) => FEATURED.indexOf(a.slug) - FEATURED.indexOf(b.slug));

  return (
    <>
      {/* Hero */}
      <section className="hero-night relative overflow-hidden text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pb-32 lg:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold text-white/90 ring-1 ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4C9BFF]" /> {topics.length} live investigations · {claimCount} dossiers
            </span>
            <h1 className="h-display mt-6 text-[48px] sm:text-[72px] lg:text-[88px]">
              Don&apos;t take the claim.
              <br />
              <span className="bg-gradient-to-r from-[#8CC0FF] to-[#C9B6FF] bg-clip-text text-transparent">Trace the evidence.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
              Political claims, traced to court records, official data and original reporting — with what&apos;s established kept apart from what people believe.
            </p>
            <form action="/search" className="mt-9 flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 shadow-lift" role="search">
              <label htmlFor="q" className="sr-only">Search claims, events or institutions</label>
              <svg className="ml-3 shrink-0 text-muted" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" strokeLinecap="round" /></svg>
              <input id="q" name="q" className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-[16px] text-ink placeholder:text-muted focus:outline-none" placeholder="Search a claim, court or institution" />
              <button className="btn-accent shrink-0" type="submit">Search</button>
            </form>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/55">
              <Link href="/decompose" className="font-semibold text-white no-underline hover:underline">Paste a viral claim →</Link>
              <span>Free · No ads · Open data</span>
            </div>
          </div>

          {/* App-style preview built from a real dossier */}
          {hero && (
            <div className="relative mx-auto w-full max-w-[420px]">
              <div className="absolute -inset-8 rounded-[48px] bg-[#0666EB]/25 blur-3xl" aria-hidden="true" />
              <div className="relative rounded-[36px] bg-white p-6 text-ink shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-muted">Dossier {hero.code}</span>
                  <StatusBadge status={hero.status} />
                </div>
                <p className="mt-4 font-display text-[26px] font-bold leading-tight tracking-[-0.03em]">{hero.headline}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{REASON_LABEL[hero.reason]}</p>
                <div className="mt-5 space-y-2">
                  {hero.evidence.map((e) => (
                    <div key={e.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${e.source.isPrimary ? "bg-accent text-white" : "bg-white text-muted ring-1 ring-line"}`}>
                        {e.source.isPrimary ? "P" : "S"}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{e.source.title}</span>
                        <span className="block text-xs text-muted">{SOURCE_TYPE_LABEL[e.source.sourceType]} · {e.source.publisher}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl bg-ink p-4 text-white">
                  <p className="text-xs font-medium text-white/60">Your assessment</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm font-semibold">
                    <span className="rounded-xl bg-white py-2 text-ink">Agree</span>
                    <span className="rounded-xl bg-white/10 py-2">Disagree</span>
                    <span className="rounded-xl bg-white/10 py-2">Unsure</span>
                  </div>
                </div>
              </div>
              <div className="glass absolute -bottom-10 -left-8 hidden px-4 py-3 text-white sm:block">
                <p className="text-xs text-white/60">Independent origins</p>
                <p className="font-display text-2xl font-bold">{hero.evidence.length} sources</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 mx-auto -mt-12 max-w-7xl px-4 sm:px-6">
        <div className="card grid grid-cols-2 gap-6 p-6 sm:p-8 lg:grid-cols-4">
          {[
            [String(topics.length), "Investigations"],
            [String(claimCount), "Claim dossiers"],
            [String(sourceCount), "Cited sources"],
            [`${Math.round((primaryCount / Math.max(sourceCount, 1)) * 100)}%`, "Primary records"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">{n}</p>
              <p className="mt-1 text-[15px] text-muted">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Topics */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Investigations</span>
            <h2 className="h-display mt-4 text-4xl sm:text-5xl">Pick a story. Follow the record.</h2>
          </div>
          <Link href="/topics" className="btn-ghost no-underline">All topics</Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((t, i) => (
            <Link
              key={t.id}
              href={`/topics/${t.slug}`}
              className={`group relative flex min-h-[260px] flex-col overflow-hidden rounded-xl3 p-7 text-white no-underline shadow-card transition-transform duration-200 hover:-translate-y-1 ${i === 0 ? "lg:col-span-2" : ""}`}
              style={{ background: tileGradient(i) }}
            >
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-125" aria-hidden="true" />
              <div className="relative flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur"><TopicGlyph category={t.category} /></span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">{t.category}</span>
              </div>
              <h3 className="relative mt-auto font-display text-[30px] font-bold leading-tight tracking-[-0.03em]">{t.title}</h3>
              <p className="relative mt-2 line-clamp-2 max-w-lg text-[15px] text-white/75">{t.summary}</p>
              <p className="relative mt-4 text-sm font-semibold text-white/90">{t._count.claims} dossiers · {t._count.events} events <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span></p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 pt-28 sm:px-6">
        <div className="text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="h-display mx-auto mt-4 max-w-3xl text-4xl sm:text-5xl">Three steps from viral post to verified record.</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            ["1", "Find the claim", "Start with a precise statement, not a political team. Paste anything and we split it into testable questions."],
            ["2", "Inspect the sources", "Court records, statutes, official data and original reporting — with ten copies of one press release counted once."],
            ["3", "Make your call", "Vote before and after reading. See how evidence moves people, without mistaking popularity for fact."],
          ].map(([n, t, d]) => (
            <div key={n} className="soft p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink font-display text-xl font-bold text-white">{n}</span>
              <h3 className="mt-6 font-display text-2xl font-bold tracking-[-0.02em]">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Layers */}
      <section className="mx-auto max-w-7xl px-4 pt-28 sm:px-6">
        <div className="grid items-center gap-12 rounded-[36px] bg-surface p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Our rule</span>
            <h2 className="h-display mt-4 text-4xl sm:text-5xl">A 90% vote doesn&apos;t make a false claim true.</h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
              Every dossier keeps three layers apart. Labels come from evidence only — votes are never read when we set them.
            </p>
            <Link href="/methodology" className="btn-primary mt-8 no-underline">Read the methodology</Link>
          </div>
          <div className="space-y-3">
            {[
              ["A", "What the evidence establishes", "Records, rulings, data and corroborated facts — with provenance.", "bg-ink text-white"],
              ["B", "What the facts mean", "Competing interpretations and legal analyses, reasoning shown.", "bg-white text-ink"],
              ["C", "What people believe", "Votes and confidence from participating users. Never a label.", "bg-white text-ink"],
            ].map(([k, t, d, cls]) => (
              <div key={k} className={`flex gap-4 rounded-xl3 p-6 shadow-card ${cls}`}>
                <span className="font-display text-3xl font-bold opacity-40">{k}</span>
                <div>
                  <p className="font-display text-xl font-bold tracking-[-0.02em]">{t}</p>
                  <p className="mt-1 text-[15px] opacity-70">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured claims */}
      <section className="mx-auto max-w-7xl px-4 pt-28 sm:px-6">
        <span className="eyebrow">Frequently misread</span>
        <h2 className="h-display mt-4 text-4xl sm:text-5xl">What the record actually says.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {featured.map((c) => <ClaimCard key={c.id} claim={c} topic={c.topic} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pt-28 sm:px-6">
        <div className="hero-night overflow-hidden rounded-[36px] px-8 py-16 text-center text-white sm:px-16">
          <h2 className="h-display mx-auto max-w-3xl text-4xl sm:text-6xl">Saw a claim today? Check it in seconds.</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">Paste any post or headline. We break it into the questions that matter and point you to the evidence.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/decompose" className="btn-light no-underline">Check a claim</Link>
            <Link href="/topics" className="btn border border-white/25 text-white no-underline hover:bg-white/10">Browse investigations</Link>
          </div>
        </div>
      </section>
    </>
  );
}
