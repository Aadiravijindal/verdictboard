import type { ClaimStatus, ReasonCode } from "@prisma/client";
import { REASON_LABEL, STATUS_DESCRIPTION, STATUS_LABEL } from "@/lib/labels";

const CHIP: Record<ClaimStatus, string> = {
  WIDELY_AGREED: "bg-agreed-soft text-agreed",
  DISPUTED: "bg-disputed-soft text-disputed",
  UNVERIFIED: "bg-unverified-soft text-unverified",
};

function Glyph({ status }: { status: ClaimStatus }) {
  if (status === "WIDELY_AGREED")
    return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" /><path d="M4 7.2l2 2 4-4.2" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (status === "DISPUTED")
    return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="currentColor" /><path d="M4 7h6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="7" cy="7" r="1.6" fill="currentColor" /></svg>;
}

export function StatusBadge({ status, reason, size = "sm" }: { status: ClaimStatus; reason?: ReasonCode; size?: "sm" | "lg" }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2" title={STATUS_DESCRIPTION[status]}>
      <span className={`chip ${CHIP[status]} ${size === "lg" ? "px-3.5 py-1.5 text-sm" : ""}`}>
        <Glyph status={status} />
        {STATUS_LABEL[status]}
      </span>
      {reason && <span className="text-[13px] font-medium text-muted">{REASON_LABEL[reason]}</span>}
    </span>
  );
}
