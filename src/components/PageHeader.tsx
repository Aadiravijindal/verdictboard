import Link from "next/link";

/** Standard page intro: soft surface band with eyebrow, title and lede. */
export function PageHeader({ eyebrow, title, lede, crumbs, children }: { eyebrow?: string; title: React.ReactNode; lede?: React.ReactNode; crumbs?: [string, string][]; children?: React.ReactNode }) {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted">
            {crumbs.map(([href, label], i) => (
              <span key={href} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                <Link href={href} className="no-underline hover:text-ink">{label}</Link>
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="h-display mt-4 max-w-4xl text-[44px] sm:text-6xl lg:text-7xl">{title}</h1>
        {lede && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{lede}</div>}
        {children}
      </div>
    </section>
  );
}
