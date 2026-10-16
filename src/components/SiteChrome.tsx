import Link from "next/link";
import { getCurrentUser, hasRole } from "@/lib/auth";
import { NavLinks } from "./NavLinks";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:bg-accent focus:px-3 focus:py-1 focus:text-canvas">
        Skip to content
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2 no-underline">
          <span className="h-display text-2xl text-ink">Verdict<span className="text-accent">Board</span></span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted sm:inline">Evidence room</span>
        </Link>
        <NavLinks
          links={[
            { href: "/topics", label: "Topics" },
            { href: "/claims", label: "Claims" },
            { href: "/decompose", label: "Check a claim" },
            { href: "/methodology", label: "Method" },
            ...(hasRole(user, "REVIEWER") ? [{ href: "/admin", label: "Desk" }] : []),
            user ? { href: "/account", label: "Account" } : { href: "/login", label: "Sign in" },
          ]}
        />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="h-display text-lg text-accent sm:text-2xl">No political team colours. No hidden evidence. No silent corrections.</p>
        <div className="mt-8 grid gap-6 text-sm text-muted sm:grid-cols-4">
          <div>
            <p className="label mb-2">Platform</p>
            <ul className="space-y-1">
              <li><Link href="/topics">Topics</Link></li>
              <li><Link href="/claims">All claims</Link></li>
              <li><Link href="/search">Search</Link></li>
              <li><Link href="/decompose">Check a claim</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-2">Trust</p>
            <ul className="space-y-1">
              <li><Link href="/methodology">Methodology</Link></li>
              <li><Link href="/corrections">Corrections log</Link></li>
              <li><Link href="/ai-policy">How we use AI</Link></li>
              <li><Link href="/about">Funding &amp; governance</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-2">Open data</p>
            <ul className="space-y-1">
              <li><Link href="/api/public/claims" prefetch={false}>Claims API (JSON)</Link></li>
              <li><Link href="/about#api">API documentation</Link></li>
            </ul>
          </div>
          <div>
            <p className="label mb-2">Votes</p>
            <p>Results show what participating users believe — not what the public believes, and not what is true.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
