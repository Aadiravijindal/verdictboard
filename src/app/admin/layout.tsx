import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Editorial desk", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("REVIEWER");
  const links = [
    ["/admin", "Overview"],
    ["/admin/research", "Research desk"],
    ["/admin/claims", "Claims"],
    ["/admin/reports", "Challenges"],
    ["/admin/sources", "Link health"],
    ["/admin/audit", "Audit log"],
    ...(user.role === "ADMIN" ? [["/admin/users", "Users"]] : []),
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
        <p className="h-display text-3xl">Editorial desk</p>
        <p className="label">{user.email} · {user.role}</p>
      </div>
      <nav className="mt-4 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-[0.12em]" aria-label="Desk">
        {links.map(([href, label]) => <Link key={href} href={href} className="no-underline hover:text-accent">{label}</Link>)}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
