import type { ClaimKind, ClaimStatus, EvidenceRelation, ReasonCode, SourceType, Stance } from "@prisma/client";

export const STATUS_LABEL: Record<ClaimStatus, string> = {
  WIDELY_AGREED: "Widely agreed",
  DISPUTED: "Disputed",
  UNVERIFIED: "Unverified",
};

export const STATUS_DESCRIPTION: Record<ClaimStatus, string> = {
  WIDELY_AGREED: "Strong evidence and broad agreement on this specific proposition. Not a synonym for 'true' — read the scope.",
  DISPUTED: "Material disagreement remains about the facts, their interpretation or the applicable legal standard.",
  UNVERIFIED: "The available evidence is insufficient to establish the claim reliably. This is not the same as false.",
};

export const STATUS_CLASS: Record<ClaimStatus, string> = {
  WIDELY_AGREED: "text-agreed border-agreed",
  DISPUTED: "text-disputed border-disputed",
  UNVERIFIED: "text-unverified border-unverified",
};

export const REASON_LABEL: Record<ReasonCode, string> = {
  CONFIRMED_PRIMARY: "Confirmed by primary records",
  CORROBORATED_INDEPENDENT: "Corroborated by multiple independent sources",
  PARTIALLY_SUPPORTED: "Partially supported",
  CONTRADICTED: "Contradicted by evidence",
  INSUFFICIENT_EVIDENCE: "Insufficient evidence",
  LEGAL_UNRESOLVED: "Legal question unresolved",
  INTERPRETATION_DISPUTED: "Interpretation disputed",
  OUTDATED: "Outdated",
};

export const KIND_LABEL: Record<ClaimKind, string> = {
  FACTUAL: "Did it happen?",
  CAUSAL: "What caused it?",
  RESPONSIBILITY: "Who is responsible?",
  LEGAL: "What does the law say?",
  VALUE: "Was it justified?",
};

export const KIND_PROMPT: Record<ClaimKind, { agree: string; disagree: string; unsure: string }> = {
  FACTUAL: { agree: "Agree — the evidence supports the claim", disagree: "Disagree — the evidence does not support it", unsure: "Unsure — I need more evidence" },
  CAUSAL: { agree: "Agree — the evidence supports this cause", disagree: "Disagree — the causal claim is not supported", unsure: "Unsure — the causal link is unclear to me" },
  RESPONSIBILITY: { agree: "Agree — responsibility is established", disagree: "Disagree — responsibility is not established", unsure: "Unsure — I need more evidence" },
  LEGAL: { agree: "Agree — the evidence supports this legal proposition", disagree: "Disagree — the evidence does not support it", unsure: "Unsure — I can't assess the legal question" },
  VALUE: { agree: "Agree", disagree: "Disagree", unsure: "Unsure" },
};

export const RELATION_LABEL: Record<EvidenceRelation, string> = {
  SUPPORTS: "Supports",
  PARTIALLY_SUPPORTS: "Partly supports",
  CONTRADICTS: "Challenges",
  CONTEXT: "Context",
};

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  COURT_RECORD: "Court record",
  LEGISLATION: "Legislation",
  OFFICIAL_RECORD: "Official record",
  OFFICIAL_STATEMENT: "Official statement",
  OFFICIAL_DATA: "Official data",
  INTERGOVERNMENTAL: "Intergovernmental body",
  INDEPENDENT_INVESTIGATION: "Independent investigation",
  ACADEMIC: "Academic research",
  NGO_REPORT: "NGO report",
  NEWS_REPORT: "News report",
  PARTY_STATEMENT: "Interested party",
  OTHER: "Other",
};

export const STANCE_LABEL: Record<Stance, string> = { AGREE: "Agree", DISAGREE: "Disagree", UNSURE: "Unsure" };

export const VARIANT_LABEL: Record<string, string> = {
  ACCURATE: "Accurate",
  OVERSTATED: "Overstated",
  MISLEADING: "Misleading",
  CONTRADICTED: "Contradicted",
  UNSUPPORTED: "Unsupported",
};

export function formatDate(d: Date | string | null | undefined, precision: "DAY" | "MONTH" | "YEAR" = "DAY"): string {
  if (!d) return "Undated";
  const date = typeof d === "string" ? new Date(d) : d;
  const opts: Intl.DateTimeFormatOptions =
    precision === "YEAR" ? { year: "numeric", timeZone: "UTC" } : precision === "MONTH" ? { year: "numeric", month: "short", timeZone: "UTC" } : { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" };
  return date.toLocaleDateString("en-GB", opts);
}

export function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export interface Variant {
  text: string;
  assessment: string;
  explanation: string;
}

export function asVariants(v: unknown): Variant[] {
  return Array.isArray(v) ? (v.filter((x) => x && typeof x === "object" && "text" in x) as Variant[]) : [];
}

export const COUNTRIES = [
  "India", "Israel", "Palestine", "United States", "United Kingdom", "Pakistan", "Bangladesh", "Canada", "Australia",
  "Germany", "France", "Russia", "Ukraine", "China", "Brazil", "South Africa", "Nigeria", "Egypt", "Jordan", "Lebanon",
  "Turkey", "Iran", "Saudi Arabia", "United Arab Emirates", "Indonesia", "Japan", "Other",
];

export const LEANINGS = ["Left", "Centre-left", "Centre", "Centre-right", "Right", "None of these"];
