import Link from "next/link";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { NavLinks } from "./NavLinks";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`flex items-center gap-2 font-display text-[21px] font-bold tracking-[-0.04em] ${light ? "text-white" : "text-ink"}`}>
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill={light ? "#fff" : "#0A0B0D"} />
        <path d="M9 9l7 15 7-15" fill="none" stroke={light ? "#0A0B0D" : "#fff"} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="23.5" cy="23.5" r="2.5" fill="#0666EB" />
      </svg>
      VerdictBoard
    </span>
  );
}

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/80 backdrop-blur-xl">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="no-underline" aria-label="VerdictBoard home">
          <Logo />
        </Link>
        <NavLinks
          links={[
            { href: "/topics", label: "Topics" },
            { href: "/claims", label: "Claims" },
            { href: "/methodology", label: "How it works" },
            { href: "/corrections", label: "Corrections" },
            ...(hasRole(user, "REVIEWER") ? [{ href: "/admin", label: "Desk" }] : []),
          ]}
          account={user ? { href: "/account", label: "Account" } : { href: "/login", label: "Log in" }}
          cta={{ href: "/decompose", label: "Check a claim" }}
        />
      </div>
    </header>
  );
}

export function SiteFooter() {
  const cols: [string, [string, string][]][] = [
    ["Product", [["/topics", "Topics"], ["/claims", "All claims"], ["/search", "Search"], ["/decompose", "Check a claim"]]],
    ["Trust", [["/methodology", "Methodology"], ["/corrections", "Corrections log"], ["/ai-policy", "How we use AI"], ["/about", "Funding & governance"]]],
    ["Open data", [["/api/public/claims", "Claims API (JSON)"], ["/about#api", "API documentation"]]],
  ];
  return (
    <footer className="mt-24 bg-night text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/60">
              No political team colours. No hidden evidence. No silent corrections. Votes show what participating users believe — not what the public believes, and not what is true.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {cols.map(([title, links]) => (
              <div key={title}>
                <p className="text-sm font-semibold text-white">{title}</p>
                <ul className="mt-4 space-y-2.5 text-[15px] text-white/60">
                  {links.map(([href, label]) => (
                    <li key={href}>
                      <Link href={href} prefetch={href.startsWith("/api") ? false : undefined} className="no-underline transition-colors hover:text-white">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/40">
          <p>© {new Date().getFullYear()} VerdictBoard. Dossiers licensed CC BY 4.0.</p>
          <p>Evidence first. Opinions second. Never confused.</p>
        </div>
      </div>
    </footer>
  );
}
