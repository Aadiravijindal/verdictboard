import type { Prisma, User } from "@prisma/client";
import { prisma } from "./db";
import { audit } from "./audit";
import { env } from "./env";
import { researchClaim, type ResearchResult } from "./ai/research";
import { parseSeedDate } from "./content-validate";
import { normalizeUrl } from "./ai/verify";

export async function runResearchJob(jobId: string): Promise<void> {
  const claimed = await prisma.researchJob.updateMany({ where: { id: jobId, status: "QUEUED" }, data: { status: "RUNNING" } });
  if (claimed.count !== 1) return;
  const job = await prisma.researchJob.findUniqueOrThrow({ where: { id: jobId } });
  try {
    const topic = job.topicSlug ? await prisma.topic.findUnique({ where: { slug: job.topicSlug } }) : null;
    const result = await researchClaim(job.input, topic ? `Topic: ${topic.title}. Scope: ${topic.scope}` : undefined);
    await prisma.researchJob.update({
      where: { id: jobId },
      data: {
        status: "NEEDS_REVIEW",
        output: result as unknown as Prisma.InputJsonValue,
        usage: result.usage as unknown as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });
  } catch (e) {
    await prisma.researchJob.update({
      where: { id: jobId },
      data: { status: "FAILED", error: e instanceof Error ? e.message : String(e), completedAt: new Date() },
    });
  }
}

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 70) || "claim";
}

async function uniqueSlug(base: string, exists: (s: string) => Promise<boolean>): Promise<string> {
  let slug = base;
  for (let i = 2; await exists(slug); i++) slug = `${base}-${i}`;
  return slug;
}

async function nextClaimCode(): Promise<string> {
  const codes = await prisma.claim.findMany({ select: { code: true } });
  const max = codes.reduce((m, c) => Math.max(m, Number(c.code.replace(/\D/g, "")) || 0), 0);
  return `CLM-${String(max + 1).padStart(3, "0")}`;
}

/**
 * Turns a reviewed research job into a DRAFT claim. Only evidence the editor
 * selected is kept; every link is marked AI-generated and unapproved until an
 * editor approves it on the claim review screen.
 */
export async function acceptResearchJob(jobId: string, editor: User, topicSlug: string, selectedEvidence: number[]): Promise<string> {
  const job = await prisma.researchJob.findUniqueOrThrow({ where: { id: jobId } });
  if (job.status !== "NEEDS_REVIEW") throw new Error("Only jobs awaiting review can be accepted.");
  const topic = await prisma.topic.findUniqueOrThrow({ where: { slug: topicSlug } });
  const out = job.output as unknown as ResearchResult;
  const { draft, checks } = out;

  const slug = await uniqueSlug(slugify(draft.headline || draft.proposition), async (s) => !!(await prisma.claim.findUnique({ where: { slug: s } })));
  const claim = await prisma.claim.create({
    data: {
      slug, code: await nextClaimCode(), topicId: topic.id, headline: draft.headline, proposition: draft.proposition,
      kind: draft.kind, status: draft.suggestedStatus, reason: draft.suggestedReason, statusRationale: draft.statusRationale,
      scope: draft.scope, summary: draft.summary, decomposition: draft.decomposition, established: draft.established,
      contested: draft.contested, counterevidence: draft.counterevidence, missingEvidence: draft.missingEvidence,
      publishStatus: "DRAFT", aiAssisted: true, draftedById: editor.id,
    },
  });

  const sourceIdByUrl = new Map<string, string>();
  for (const s of draft.sources) {
    const key = normalizeUrl(s.url);
    const existing = await prisma.source.findFirst({ where: { url: s.url } });
    if (existing) {
      sourceIdByUrl.set(key, existing.id);
      continue;
    }
    const sSlug = await uniqueSlug(`ai-${slugify(s.publisher)}-${slugify(s.title).slice(0, 30)}`, async (x) => !!(await prisma.source.findUnique({ where: { slug: x } })));
    let publishedAt: Date | null = null;
    if (/^\d{4}(-\d{2}(-\d{2})?)?$/.test(s.publishedAt)) publishedAt = parseSeedDate(s.publishedAt).date;
    const row = await prisma.source.create({
      data: {
        slug: sSlug, title: s.title, publisher: s.publisher, url: s.url, publishedAt, sourceType: s.sourceType,
        isPrimary: s.isPrimary, description: `Added by research assistant; review before publication.`, limitations: s.limitations || null,
      },
    });
    sourceIdByUrl.set(key, row.id);
  }
  for (const s of draft.sources) {
    if (!s.repeatsUrl) continue;
    const from = sourceIdByUrl.get(normalizeUrl(s.url));
    const to = sourceIdByUrl.get(normalizeUrl(s.repeatsUrl));
    if (from && to && from !== to) await prisma.source.update({ where: { id: from }, data: { derivedFromId: to } });
  }

  let order = 0;
  for (const i of selectedEvidence) {
    const e = draft.evidence[i];
    const sourceId = e && sourceIdByUrl.get(normalizeUrl(e.url));
    if (!e || !sourceId) continue;
    await prisma.evidenceLink.upsert({
      where: { claimId_sourceId_relation: { claimId: claim.id, sourceId, relation: e.relation } },
      create: {
        claimId: claim.id, sourceId, relation: e.relation, establishes: e.establishes, quote: e.quote || null,
        quoteVerified: !!checks[i]?.quoteVerified, locator: e.locator || null, aiGenerated: true, approved: false,
        reviewerNote: checks[i]?.urlSeen ? null : "URL was not among retrieved pages — verify it exists.", sortOrder: order++,
      },
      update: {},
    });
  }

  await prisma.researchJob.update({ where: { id: jobId }, data: { status: "ACCEPTED", claimId: claim.id } });
  await audit(editor.id, "research.accept", "Claim", claim.id, { jobId, evidence: selectedEvidence.length });
  return claim.id;
}

/** Problems that block publication of a claim. Empty array means publishable. */
export async function publicationBlockers(claimId: string, publisher: User): Promise<string[]> {
  const claim = await prisma.claim.findUniqueOrThrow({ where: { id: claimId }, include: { evidence: true } });
  const blockers: string[] = [];
  if (claim.publishStatus !== "IN_REVIEW") blockers.push("The claim must be submitted for review first.");
  if (claim.evidence.length === 0) blockers.push("At least one evidence link is required.");
  if (claim.evidence.some((e) => !e.approved)) blockers.push("Every evidence link must be approved by an editor.");
  if (claim.evidence.some((e) => e.aiGenerated && e.quote && !e.quoteVerified)) {
    blockers.push("AI-drafted quotes that could not be matched to retrieved text must be verified manually or removed.");
  }
  if (env.requireSecondReviewer && claim.draftedById && claim.draftedById === publisher.id) {
    blockers.push("A second editor must publish a claim you drafted.");
  }
  return blockers;
}
