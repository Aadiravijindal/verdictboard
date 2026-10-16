import type { Metadata } from "next";
import type { ClaimStatus, ClaimKind } from "@prisma/client";
import { prisma } from "@/lib/db";
import { published } from "@/lib/queries";
import { ClaimCard } from "@/components/ClaimCard";
import { KIND_LABEL, STATUS_LABEL } from "@/lib/labels";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "All claims" };

const STATUSES = Object.keys(STATUS_LABEL) as ClaimStatus[];
const KINDS = Object.keys(KIND_LABEL) as ClaimKind[];

export default async function ClaimsPage({ searchParams }: { searchParams: Promise<{ status?: string; kind?: string; topic?: string }> }) {
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as ClaimStatus) ? (sp.status as ClaimStatus) : undefined;
  const kind = KINDS.includes(sp.kind as ClaimKind) ? (sp.kind as ClaimKind) : undefined;
  const [claims, topics] = await Promise.all([
    prisma.claim.findMany({
      where: { ...published, status, kind, topic: sp.topic ? { slug: sp.topic } : undefined },
      include: { topic: true },
      orderBy: [{ topic: { sortOrder: "asc" } }, { code: "asc" }],
    }),
    prisma.topic.findMany({ where: published, orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6">
      <span className="eyebrow">Index</span>
      <h1 className="h-display mt-4 text-[44px] sm:text-6xl">Claim dossiers</h1>
      <form className="mt-8 flex flex-wrap items-end gap-3 border border-line bg-panel p-4">
        <label><span className="label">Label</span>
          <select name="status" defaultValue={status ?? ""} className="input mt-1 w-44">
            <option value="">All</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </label>
        <label><span className="label">Question type</span>
          <select name="kind" defaultValue={kind ?? ""} className="input mt-1 w-52">
            <option value="">All</option>
            {KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
          </select>
        </label>
        <label><span className="label">Topic</span>
          <select name="topic" defaultValue={sp.topic ?? ""} className="input mt-1 w-60">
            <option value="">All</option>
            {topics.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}
          </select>
        </label>
        <button className="btn-primary">Filter</button>
        <p className="label ml-auto">{claims.length} dossiers</p>
      </form>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {claims.map((c) => <ClaimCard key={c.id} claim={c} topic={c.topic} />)}
      </div>
    </div>
  );
}
