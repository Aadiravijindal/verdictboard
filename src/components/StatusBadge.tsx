import type { ClaimStatus, ReasonCode } from "@prisma/client";
import { REASON_LABEL, STATUS_CLASS, STATUS_DESCRIPTION, STATUS_LABEL } from "@/lib/labels";

export function StatusBadge({ status, reason, size = "sm" }: { status: ClaimStatus; reason?: ReasonCode; size?: "sm" | "lg" }) {
  const shape = status === "WIDELY_AGREED" ? "●" : status === "DISPUTED" ? "◆" : "○";
  return (
    <span className="inline-flex flex-wrap items-center gap-2" title={STATUS_DESCRIPTION[status]}>
      <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono uppercase tracking-[0.12em] ${STATUS_CLASS[status]} ${size === "lg" ? "text-xs" : "text-[10px]"}`}>
        <span aria-hidden="true">{shape}</span>
        {STATUS_LABEL[status]}
      </span>
      {reason && <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{REASON_LABEL[reason]}</span>}
    </span>
  );
}
