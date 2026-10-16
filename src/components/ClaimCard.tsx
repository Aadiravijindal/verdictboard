import Link from "next/link";
import type { Claim, Topic } from "@prisma/client";
import { KIND_LABEL } from "@/lib/labels";
import { StatusBadge } from "./StatusBadge";

export function ClaimCard({ claim, topic }: { claim: Claim; topic?: Topic }) {
  return (
    <Link
      href={`/claims/${claim.slug}`}
      className="group flex h-full flex-col rounded-xl3 bg-white p-6 no-underline shadow-card ring-1 ring-line/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex items-center justify-between gap-3 text-[13px] font-medium text-muted">
        <span>{KIND_LABEL[claim.kind]}</span>
        <span className="font-mono text-xs">{claim.code}</span>
      </div>
      <h3 className="mt-3 font-display text-[22px] font-bold leading-tight tracking-[-0.025em] text-ink">{claim.headline}</h3>
      <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-muted">{claim.proposition}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
        <StatusBadge status={claim.status} />
        {topic ? <span className="text-[13px] font-medium text-muted">{topic.title}</span> : <span className="text-[13px] font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">Open dossier →</span>}
      </div>
    </Link>
  );
}
