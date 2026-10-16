import Link from "next/link";
import type { Metadata } from "next";
import { getTopics } from "@/lib/queries";
import { formatDate } from "@/lib/labels";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Topics" };

export default async function TopicsPage() {
  const topics = await getTopics();
  const categories = [...new Set(topics.map((t) => t.category))];
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="label">Index</p>
      <h1 className="h-display mt-2 text-6xl sm:text-7xl">Topics</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Each topic is a structured investigation: a timeline, precise claim dossiers and documented perspectives. We publish fewer topics, researched deeply, rather than many thinly.
      </p>
      {categories.map((cat) => (
        <section key={cat} className="mt-12">
          <h2 className="label border-b border-line pb-2">{cat}</h2>
          <ul className="divide-y divide-line">
            {topics.filter((t) => t.category === cat).map((t) => (
              <li key={t.id}>
                <Link href={`/topics/${t.slug}`} className="group grid gap-2 py-5 no-underline sm:grid-cols-[120px_1fr_200px] sm:items-baseline">
                  <span className="label">{t.code}</span>
                  <span>
                    <span className="h-display block text-3xl text-ink group-hover:text-accent">{t.title}</span>
                    <span className="mt-1 block text-sm text-muted">{t.summary}</span>
                  </span>
                  <span className="label sm:text-right">{t._count.claims} claims · reviewed {formatDate(t.lastReviewedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
