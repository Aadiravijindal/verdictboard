"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    <nav aria-label="Main">
      <button type="button" className="btn-ghost md:hidden" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)}>
        Menu
      </button>
      <ul className="hidden items-center gap-4 font-mono text-xs uppercase tracking-[0.12em] md:flex">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="bracket text-ink no-underline hover:text-accent" aria-current={isActive(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      {open && (
        <ul id="mobile-nav" className="absolute inset-x-0 top-full border-b border-line bg-canvas px-4 py-3 font-mono text-sm uppercase tracking-[0.12em] md:hidden">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)} className="block py-2 no-underline" aria-current={isActive(l.href) ? "page" : undefined}>
                {isActive(l.href) ? `[ ${l.label} ]` : l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
