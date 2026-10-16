// Seed content format. Each topic file is reviewed like code: every change goes
// through a pull request, and the seed script records material changes as
// public corrections once a topic has been published.

export type SourceType =
  | "COURT_RECORD"
  | "LEGISLATION"
  | "OFFICIAL_RECORD"
  | "OFFICIAL_STATEMENT"
  | "OFFICIAL_DATA"
  | "INTERGOVERNMENTAL"
  | "INDEPENDENT_INVESTIGATION"
  | "ACADEMIC"
  | "NGO_REPORT"
  | "NEWS_REPORT"
  | "PARTY_STATEMENT"
  | "OTHER";

export type ClaimStatus = "WIDELY_AGREED" | "DISPUTED" | "UNVERIFIED";

export type ReasonCode =
  | "CONFIRMED_PRIMARY"
  | "CORROBORATED_INDEPENDENT"
  | "PARTIALLY_SUPPORTED"
  | "CONTRADICTED"
  | "INSUFFICIENT_EVIDENCE"
  | "LEGAL_UNRESOLVED"
  | "INTERPRETATION_DISPUTED"
  | "OUTDATED";

export type ClaimKind = "FACTUAL" | "CAUSAL" | "RESPONSIBILITY" | "LEGAL" | "VALUE";

export type EvidenceRelation = "SUPPORTS" | "PARTIALLY_SUPPORTS" | "CONTRADICTS" | "CONTEXT";

export interface SourceSeed {
  slug: string;
  title: string;
  publisher: string;
  author?: string;
  url: string;
  /** ISO date (YYYY-MM-DD, YYYY-MM or YYYY). */
  publishedAt?: string;
  sourceType: SourceType;
  isPrimary: boolean;
  description: string;
  limitations?: string;
  /** Slug of the original source this one repeats. */
  derivedFrom?: string;
}

export interface EventSeed {
  slug: string;
  /** ISO date (YYYY-MM-DD, YYYY-MM or YYYY). Precision is inferred. */
  date: string;
  title: string;
  description: string;
  certainty?: "DOCUMENTED" | "DETAILS_DISPUTED" | "INTERPRETATION";
  disputeNote?: string;
  keyEvent?: boolean;
  sources: string[];
}

export interface EvidenceSeed {
  source: string;
  relation: EvidenceRelation;
  establishes: string;
  locator?: string;
  /** Only include a verbatim quote if it has been checked against the source. */
  quote?: string;
}

export interface VariantSeed {
  text: string;
  assessment: "ACCURATE" | "OVERSTATED" | "MISLEADING" | "CONTRADICTED" | "UNSUPPORTED";
  explanation: string;
}

export interface ClaimSeed {
  slug: string;
  code: string;
  headline: string;
  proposition: string;
  kind: ClaimKind;
  status: ClaimStatus;
  reason: ReasonCode;
  statusRationale: string;
  scope: string;
  summary: string;
  decomposition: string[];
  established: string[];
  contested: string[];
  counterevidence: string[];
  missingEvidence: string[];
  variants?: VariantSeed[];
  evidence: EvidenceSeed[];
}

export interface PerspectiveSeed {
  slug: string;
  title: string;
  heldBy: string;
  summary: string;
  arguments: string[];
  counterarguments: string[];
  claim?: string;
  sources: string[];
}

export interface TopicSeed {
  slug: string;
  code: string;
  title: string;
  category: string;
  region: string;
  kicker: string;
  summary: string;
  overview: string;
  scope: string;
  sortOrder: number;
  lastReviewed: string;
  sources: SourceSeed[];
  events: EventSeed[];
  claims: ClaimSeed[];
  perspectives: PerspectiveSeed[];
}
