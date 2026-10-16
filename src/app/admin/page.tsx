import Link from "next/link";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export default async function AdminHome() {
  const [openReports, inReview, drafts, jobs, broken, users, votes] = await Promise.all([
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.claim.count({ where: { publishStatus: "IN_REVIEW" } }),
    prisma.claim.count({ where: { publishStatus: "DRAFT" } }),
    prisma.researchJob.count({ where: { status: "NEEDS_REVIEW" } }),
    prisma.source.count({ where: { OR: [{ lastHttpStatus: 0 }, { lastHttpStatus: { in: [404, 410] } }] } }),
    prisma.user.count(),
    prisma.vote.count(),
  ]);
  const cards: [string, number, string][] = [
    ["Open challenges", openReports, "/admin/reports"],
    ["Claims awaiting second review", inReview, "/admin/claims?status=IN_REVIEW"],
    ["Drafts", drafts, "/admin/claims?status=DRAFT"],
    ["Research drafts to review", jobs, "/admin/research"],
    ["Broken source links", broken, "/admin/sources"],
  ];
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(([l, n, href]) => (
          <Link key={l} href={href} className="panel p-4 no-underline hover:border-accent">
            <p className="label">{l}</p>
            <p className="h-display mt-2 text-5xl">{n}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3 text-sm">
        <p className="panel p-4">Accounts: <strong>{users}</strong></p>
        <p className="panel p-4">Votes recorded: <strong>{votes}</strong></p>
        <p className="panel p-4">AI research: <strong>{env.aiEnabled ? `enabled (${env.aiModel})` : "disabled — set ANTHROPIC_API_KEY"}</strong></p>
      </div>
      <p className="mt-8 text-sm text-muted">Second-reviewer rule: <strong>{env.requireSecondReviewer ? "on" : "off"}</strong>. Minimum subgroup size: <strong>{env.minSubgroupSize}</strong>.</p>
    </div>
  );
}
