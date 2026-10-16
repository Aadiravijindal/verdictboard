// Layer C — what participating users believe. Nothing in this module is ever
// used to compute a claim's evidence label.
import type { Stance, VotePhase } from "@prisma/client";
import { prisma } from "./db";
import { env } from "./env";

export const STANCES: Stance[] = ["AGREE", "DISAGREE", "UNSURE"];
export const ESTABLISHED_ACCOUNT_DAYS = 7;

export interface VoteRow {
  userId: string;
  phase: VotePhase;
  stance: Stance;
  confidence: number;
  createdAt: Date;
  accountCreatedAt: Date;
  country: string | null;
  leaning: string | null;
}

export interface Share {
  stance: Stance;
  count: number;
  share: number;
  /** 95% Wilson score interval. */
  low: number;
  high: number;
}

export interface Breakdown {
  n: number;
  shares: Share[];
  meanConfidence: number | null;
}

export interface Subgroup extends Breakdown {
  label: string;
}

export interface ClaimResults {
  phase: VotePhase;
  all: Breakdown;
  establishedAccounts: Breakdown;
  byCountry: Subgroup[];
  byLeaning: Subgroup[];
  suppressedGroups: number;
  firstVoteAt: Date | null;
  lastVoteAt: Date | null;
  impact: EvidenceImpact | null;
  minSubgroupSize: number;
}

export interface EvidenceImpact {
  pairedN: number;
  changedShare: number;
  changedLow: number;
  changedHigh: number;
  /** transitions[from][to] = count */
  transitions: Record<Stance, Record<Stance, number>>;
  meanConfidenceBefore: number;
  meanConfidenceAfter: number;
}

export function wilson(k: number, n: number, z = 1.96): { low: number; high: number } {
  if (n === 0) return { low: 0, high: 0 };
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return { low: Math.max(0, (centre - margin) / denom), high: Math.min(1, (centre + margin) / denom) };
}

export function breakdown(rows: Pick<VoteRow, "stance" | "confidence">[]): Breakdown {
  const n = rows.length;
  const shares = STANCES.map((stance) => {
    const count = rows.filter((r) => r.stance === stance).length;
    return { stance, count, share: n ? count / n : 0, ...wilson(count, n) };
  });
  const meanConfidence = n ? rows.reduce((s, r) => s + r.confidence, 0) / n : null;
  return { n, shares, meanConfidence };
}

function groupBy(rows: VoteRow[], key: (r: VoteRow) => string | null, min: number): { groups: Subgroup[]; suppressed: number } {
  const map = new Map<string, VoteRow[]>();
  for (const r of rows) {
    const k = key(r);
    if (!k) continue;
    map.set(k, [...(map.get(k) ?? []), r]);
  }
  const groups: Subgroup[] = [];
  let suppressed = 0;
  for (const [label, list] of map) {
    if (list.length >= min) groups.push({ label, ...breakdown(list) });
    else suppressed++;
  }
  groups.sort((a, b) => b.n - a.n);
  return { groups, suppressed };
}

export function evidenceImpact(rows: VoteRow[], min: number): EvidenceImpact | null {
  const before = new Map(rows.filter((r) => r.phase === "BEFORE").map((r) => [r.userId, r]));
  const pairs = rows.filter((r) => r.phase === "AFTER" && before.has(r.userId)).map((a) => [before.get(a.userId)!, a] as const);
  if (pairs.length < min) return null;
  const transitions = Object.fromEntries(STANCES.map((f) => [f, Object.fromEntries(STANCES.map((t) => [t, 0]))])) as Record<Stance, Record<Stance, number>>;
  let changed = 0;
  for (const [b, a] of pairs) {
    transitions[b.stance][a.stance]++;
    if (b.stance !== a.stance) changed++;
  }
  const ci = wilson(changed, pairs.length);
  return {
    pairedN: pairs.length,
    changedShare: changed / pairs.length,
    changedLow: ci.low,
    changedHigh: ci.high,
    transitions,
    meanConfidenceBefore: pairs.reduce((s, [b]) => s + b.confidence, 0) / pairs.length,
    meanConfidenceAfter: pairs.reduce((s, [, a]) => s + a.confidence, 0) / pairs.length,
  };
}

export function computeResults(rows: VoteRow[], phase: VotePhase, min = env.minSubgroupSize): ClaimResults {
  const inPhase = rows.filter((r) => r.phase === phase);
  const established = inPhase.filter((r) => r.createdAt.getTime() - r.accountCreatedAt.getTime() >= ESTABLISHED_ACCOUNT_DAYS * 86400_000);
  const c = groupBy(inPhase, (r) => r.country, min);
  const l = groupBy(inPhase, (r) => r.leaning, min);
  const times = inPhase.map((r) => r.createdAt.getTime());
  return {
    phase,
    all: breakdown(inPhase),
    establishedAccounts: breakdown(established),
    byCountry: c.groups,
    byLeaning: l.groups,
    suppressedGroups: c.suppressed + l.suppressed,
    firstVoteAt: times.length ? new Date(Math.min(...times)) : null,
    lastVoteAt: times.length ? new Date(Math.max(...times)) : null,
    impact: evidenceImpact(rows, min),
    minSubgroupSize: min,
  };
}

export async function viewerVotes(userId: string, claimId: string) {
  return prisma.vote.findMany({ where: { userId, claimId } });
}

/**
 * Returns aggregate results only if the viewer has voted on the claim. This is
 * the single gate for result visibility; pages and APIs must not bypass it.
 */
export async function resultsForViewer(claimId: string, viewerId: string | null): Promise<ClaimResults | null> {
  if (!viewerId) return null;
  const mine = await prisma.vote.count({ where: { claimId, userId: viewerId } });
  if (mine === 0) return null;
  const votes = await prisma.vote.findMany({
    where: { claimId, user: { banned: false, emailVerifiedAt: { not: null } } },
    select: { userId: true, phase: true, stance: true, confidence: true, createdAt: true, user: { select: { createdAt: true, country: true, leaning: true } } },
  });
  const rows: VoteRow[] = votes.map((v) => ({
    userId: v.userId, phase: v.phase, stance: v.stance, confidence: v.confidence, createdAt: v.createdAt,
    accountCreatedAt: v.user.createdAt, country: v.user.country, leaning: v.user.leaning,
  }));
  return computeResults(rows, "AFTER");
}

export function parseVoteInput(body: unknown): { phase: VotePhase; stance: Stance; confidence: number } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const phase = b.phase === "BEFORE" || b.phase === "AFTER" ? b.phase : null;
  const stance = STANCES.includes(b.stance as Stance) ? (b.stance as Stance) : null;
  const confidence = typeof b.confidence === "number" && Number.isInteger(b.confidence) && b.confidence >= 0 && b.confidence <= 100 ? b.confidence : null;
  if (!phase || !stance || confidence === null) return null;
  return { phase, stance, confidence };
}

/** Upserts the user's vote for a phase, recording any change in history. */
export async function castVote(userId: string, claimId: string, phase: VotePhase, stance: Stance, confidence: number) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.vote.findUnique({ where: { userId_claimId_phase: { userId, claimId, phase } } });
    if (!existing) return tx.vote.create({ data: { userId, claimId, phase, stance, confidence } });
    if (existing.stance === stance && existing.confidence === confidence) return existing;
    await tx.voteChange.create({
      data: { voteId: existing.id, fromStance: existing.stance, toStance: stance, fromConfidence: existing.confidence, toConfidence: confidence },
    });
    return tx.vote.update({ where: { id: existing.id }, data: { stance, confidence } });
  });
}
