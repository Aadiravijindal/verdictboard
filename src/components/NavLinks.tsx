"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type L = { href: string; label: string };

export function NavLinks({ links, account, cta }: { links: L[]; account: L; cta: L }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    <nav aria-label="Main" className="flex flex-1 items-center justify-end gap-2 md:justify-between">
      <ul className="ml-10 hidden items-center gap-1 md:flex">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 text-[15px] font-medium no-underline transition-colors ${isActive(l.href) ? "bg-surface text-ink" : "text-ink/70 hover:text-ink"}`}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="hidden items-center gap-2 md:flex">
        <Link href={account.href} className="rounded-full px-4 py-2 text-[15px] font-semibold text-ink no-underline hover:bg-surface">{account.label}</Link>
        <Link href={cta.href} className="btn-primary no-underline">{cta.label}</Link>
      </div>
      <button
        type="button"
        className="grid h-10 w-10 place-items-center rounded-full bg-surface md:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label="Menu"
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          {open ? <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> : <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
        </svg>
      </button>
      {open && (
        <div id="mobile-nav" className="absolute inset-x-0 top-full border-b border-line bg-white px-4 pb-6 pt-2 shadow-lift md:hidden">
          <ul className="space-y-1">
            {[...links, account].map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className={`block rounded-2xl px-4 py-3 text-lg font-semibold no-underline ${isActive(l.href) ? "bg-surface" : ""}`} aria-current={isActive(l.href) ? "page" : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={cta.href} onClick={() => setOpen(false)} className="btn-primary mt-4 w-full no-underline">{cta.label}</Link>
        </div>
      )}
    </nav>
  );
}
