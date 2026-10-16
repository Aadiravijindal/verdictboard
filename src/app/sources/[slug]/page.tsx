import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { RELATION_LABEL, SOURCE_TYPE_LABEL, formatDate } from "@/lib/labels";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  return prisma.source.findUnique({
    where: { slug },
    include: {
      derivedFrom: true,
      derivatives: true,
      evidence: { where: { approved: true, claim: { publishStatus: "PUBLISHED" } }, include: { claim: true } },
      events: { include: { event: { include: { topic: true } } } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = await load((await params).slug);
  return s ? { title: s.title } : {};
}

export default async function SourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const s = await load((await params).slug);
  if (!s) notFound();
  return (
    <div className="mx-auto max-w-4xl px-4 pb-12 pt-14 sm:px-6">
      <p className="label">Source record / {s.slug}</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{s.title}</h1>
      <dl className="mt-6 grid gap-4 border border-line bg-panel p-5 text-sm sm:grid-cols-2">
        <div><dt className="label">Publisher</dt><dd>{s.publisher}</dd></div>
        {s.author && <div><dt className="label">Author</dt><dd>{s.author}</dd></div>}
        <div><dt className="label">Published</dt><dd>{formatDate(s.publishedAt)}</dd></div>
        <div><dt className="label">Type</dt><dd>{SOURCE_TYPE_LABEL[s.sourceType]} · {s.isPrimary ? "Primary" : "Secondary"}</dd></div>
        <div className="sm:col-span-2"><dt className="label">What it is</dt><dd>{s.description}</dd></div>
        {s.limitations && <div className="sm:col-span-2"><dt className="label">Limitations</dt><dd className="text-disputed">{s.limitations}</dd></div>}
        <div className="sm:col-span-2"><dt className="label">Link</dt><dd className="break-all"><a href={s.url} target="_blank" rel="noopener noreferrer">{s.url}</a>{s.archiveUrl && <> · <a href={s.archiveUrl}>archived copy</a></>}</dd></div>
        {s.lastCheckedAt && <div><dt className="label">Link last checked</dt><dd>{formatDate(s.lastCheckedAt)} (HTTP {s.lastHttpStatus})</dd></div>}
      </dl>
      {s.derivedFrom && <p className="mt-6">This source repeats <Link href={`/sources/${s.derivedFrom.slug}`}>{s.derivedFrom.title}</Link>; it is not counted as independent confirmation.</p>}
      {s.derivatives.length > 0 && (
        <p className="mt-6">Repeated by: {s.derivatives.map((d, i) => <span key={d.id}>{i > 0 && ", "}<Link href={`/sources/${d.slug}`}>{d.publisher}</Link></span>)}</p>
      )}
      <h2 className="label mt-10">Cited in</h2>
      <ul className="mt-3 space-y-3">
        {s.evidence.map((e) => (
          <li key={e.id} className="panel p-4">
            <p className="label">{RELATION_LABEL[e.relation]} · {e.claim.code}</p>
            <Link href={`/claims/${e.claim.slug}`} className="mt-1 block font-semibold">{e.claim.headline}</Link>
            <p className="mt-1 text-sm text-ink/85">{e.establishes}</p>
            <div className="mt-2"><StatusBadge status={e.claim.status} /></div>
          </li>
        ))}
        {s.events.map(({ event }) => (
          <li key={event.id} className="panel p-4">
            <p className="label">Timeline · {event.topic.title} · {formatDate(event.date, event.datePrecision)}</p>
            <Link href={`/topics/${event.topic.slug}#${event.slug}`} className="mt-1 block font-semibold">{event.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
