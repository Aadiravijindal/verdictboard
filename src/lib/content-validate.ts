import type { ClaimSeed, ClaimStatus, ReasonCode, TopicSeed } from "@content/types";

/** Which reason codes may justify each main label. Encodes editorial rule 01 and 07. */
export const ALLOWED_REASONS: Record<ClaimStatus, ReasonCode[]> = {
  WIDELY_AGREED: ["CONFIRMED_PRIMARY", "CORROBORATED_INDEPENDENT", "CONTRADICTED"],
  DISPUTED: ["PARTIALLY_SUPPORTED", "LEGAL_UNRESOLVED", "INTERPRETATION_DISPUTED", "CONTRADICTED"],
  UNVERIFIED: ["INSUFFICIENT_EVIDENCE", "OUTDATED", "PARTIALLY_SUPPORTED"],
};

export interface ValidationIssue {
  level: "error" | "warning";
  where: string;
  message: string;
}

const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

export function validateClaim(claim: ClaimSeed, sourceSlugs: Set<string>, where: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const err = (message: string) => issues.push({ level: "error", where, message });
  const warn = (message: string) => issues.push({ level: "warning", where, message });

  if (!ALLOWED_REASONS[claim.status].includes(claim.reason)) {
    err(`reason ${claim.reason} cannot justify status ${claim.status}`);
  }
  if (claim.evidence.length === 0) err("a claim must cite at least one source");
  if (claim.proposition.length < 30) err("proposition is too short to be a precise, testable statement");
  if (claim.decomposition.length < 2) warn("decompose the claim into at least two sub-questions");
  if (!claim.statusRationale.trim()) err("statusRationale is required");
  if (!claim.scope.trim()) err("scope is required");

  for (const ev of claim.evidence) {
    if (!sourceSlugs.has(ev.source)) err(`evidence references unknown source "${ev.source}"`);
    if (!ev.establishes.trim()) err(`evidence from "${ev.source}" must say what it establishes`);
  }

  const relations = new Set(claim.evidence.map((e) => e.relation));
  if (claim.status === "DISPUTED" && !relations.has("CONTRADICTS") && claim.counterevidence.length === 0) {
    warn("a disputed claim should show the strongest counterevidence");
  }
  if (claim.kind === "LEGAL" && claim.reason === "CONFIRMED_PRIMARY" && claim.evidence.length === 0) {
    err("a legal claim confirmed by primary records must cite the record");
  }
  return issues;
}

export function validateTopics(topics: TopicSeed[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = { topicSlug: new Set<string>(), code: new Set<string>(), claimSlug: new Set<string>(), source: new Map<string, string>(), event: new Set<string>(), perspective: new Set<string>() };

  for (const t of topics) {
    const where = `topic:${t.slug}`;
    const err = (message: string, w = where) => issues.push({ level: "error", where: w, message });
    if (seen.topicSlug.has(t.slug)) err("duplicate topic slug");
    seen.topicSlug.add(t.slug);
    if (seen.code.has(t.code)) err(`duplicate code ${t.code}`);
    seen.code.add(t.code);
    if (!DATE_RE.test(t.lastReviewed)) err("lastReviewed must be an ISO date");

    const local = new Set<string>();
    for (const s of t.sources) {
      const w = `${where}/source:${s.slug}`;
      const owner = seen.source.get(s.slug);
      if (owner && owner !== t.slug) err(`source slug already used in topic ${owner}`, w);
      seen.source.set(s.slug, t.slug);
      local.add(s.slug);
      if (!/^https?:\/\/[^\s]+$/.test(s.url)) err("invalid url", w);
      if (s.publishedAt && !DATE_RE.test(s.publishedAt)) err("publishedAt must be ISO", w);
      if (!s.description.trim()) err("description required", w);
    }
    for (const s of t.sources) {
      if (s.derivedFrom && !local.has(s.derivedFrom)) err(`derivedFrom references unknown source ${s.derivedFrom}`, `${where}/source:${s.slug}`);
    }
    for (const e of t.events) {
      const w = `${where}/event:${e.slug}`;
      if (seen.event.has(e.slug)) err("duplicate event slug", w);
      seen.event.add(e.slug);
      if (!DATE_RE.test(e.date)) err("date must be ISO", w);
      for (const s of e.sources) if (!local.has(s)) err(`unknown source ${s}`, w);
      if (e.certainty && e.certainty !== "DOCUMENTED" && !e.disputeNote && e.certainty !== "INTERPRETATION") {
        issues.push({ level: "warning", where: w, message: "disputed events should explain what is disputed" });
      }
    }
    for (const c of t.claims) {
      const w = `${where}/claim:${c.slug}`;
      if (seen.claimSlug.has(c.slug)) err("duplicate claim slug", w);
      seen.claimSlug.add(c.slug);
      if (seen.code.has(c.code)) err(`duplicate code ${c.code}`, w);
      seen.code.add(c.code);
      issues.push(...validateClaim(c, local, w));
    }
    for (const p of t.perspectives) {
      const w = `${where}/perspective:${p.slug}`;
      if (seen.perspective.has(p.slug)) err("duplicate perspective slug", w);
      seen.perspective.add(p.slug);
      for (const s of p.sources) if (!local.has(s)) err(`unknown source ${s}`, w);
      if (p.counterarguments.length === 0) issues.push({ level: "warning", where: w, message: "perspectives should include counterarguments" });
    }
  }
  return issues;
}

/** Infers date precision from an ISO-ish date string and returns a UTC Date. */
export function parseSeedDate(value: string): { date: Date; precision: "DAY" | "MONTH" | "YEAR" } {
  const [y, m, d] = value.split("-").map(Number);
  if (d) return { date: new Date(Date.UTC(y, m - 1, d)), precision: "DAY" };
  if (m) return { date: new Date(Date.UTC(y, m - 1, 1)), precision: "MONTH" };
  return { date: new Date(Date.UTC(y, 0, 1)), precision: "YEAR" };
}
