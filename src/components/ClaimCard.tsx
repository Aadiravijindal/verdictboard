import Link from "next/link";
import type { Claim, Topic } from "@prisma/client";
import { KIND_LABEL } from "@/lib/labels";
import { StatusBadge } from "./StatusBadge";

export function ClaimCard({ claim, topic }: { claim: Claim; topic?: Topic }) {
  return (
    <Link href={`/claims/${claim.slug}`} className="group block border border-line bg-panel p-5 no-underline transition-colors hover:border-accent">
      <div className="flex items-center justify-between gap-3">
        <span className="label">{claim.code} · {KIND_LABEL[claim.kind]}</span>
        {topic && <span className="label hidden sm:inline">{topic.title}</span>}
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug text-ink group-hover:text-accent">{claim.headline}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted">{claim.proposition}</p>
      <div className="mt-4">
        <StatusBadge status={claim.status} reason={claim.reason} />
      </div>
    </Link>
  );
}
