import Link from "next/link";
import type { Metadata } from "next";
import { getTopics } from "@/lib/queries";
import { formatDate } from "@/lib/labels";
import { PageHeader } from "@/components/PageHeader";
import { TopicGlyph, tileGradient } from "@/components/Tiles";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Topics" };

export default async function TopicsPage() {
  const topics = await getTopics();
  const categories = [...new Set(topics.map((t) => t.category))];
  return (
    <>
      <PageHeader
        eyebrow="Investigations"
        title="Every topic, researched deep — not wide."
        lede="Each investigation is a timeline, a set of precise claim dossiers and the documented perspectives around them."
      />
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
        {categories.map((cat) => (
          <section key={cat} className="mt-10 first:mt-0">
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">{cat}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {topics.filter((t) => t.category === cat).map((t) => (
                <Link key={t.id} href={`/topics/${t.slug}`} className="group flex items-center gap-5 rounded-xl3 bg-white p-5 no-underline shadow-card ring-1 ring-line/70 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-white" style={{ background: tileGradient(topics.indexOf(t)) }}>
                    <TopicGlyph category={t.category} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl font-bold tracking-[-0.02em] text-ink">{t.title}</span>
                    <span className="mt-0.5 block line-clamp-1 text-[15px] text-muted">{t.summary}</span>
                    <span className="mt-1.5 block text-[13px] font-medium text-muted">{t._count.claims} dossiers · {t.region} · reviewed {formatDate(t.lastReviewedAt)}</span>
                  </span>
                  <span className="hidden text-xl text-muted transition-transform group-hover:translate-x-1 sm:block" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
