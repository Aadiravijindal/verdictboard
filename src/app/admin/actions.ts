"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import type { ClaimKind, ClaimStatus, Prisma, ReasonCode, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { env } from "@/lib/env";
import { LIMITS, rateLimit } from "@/lib/rate-limit";
import { acceptResearchJob, publicationBlockers, runResearchJob } from "@/lib/research-jobs";
import { ALLOWED_REASONS } from "@/lib/content-validate";


/**
 * Runs an action and, on failure, sends the editor back to `back` with the
 * message in the query string (production builds hide thrown messages).
 */
async function act(back: string | ((fd: FormData) => string), formData: FormData, fn: () => Promise<void>) {
  try {
    await fn();
  } catch (e) {
    unstable_rethrow(e);
    const path = typeof back === "string" ? back : back(formData);
    const msg = e instanceof Error ? e.message : "Action failed.";
    redirect(`${path}?error=${encodeURIComponent(msg.slice(0, 300))}`);
  }
}

const lines = (v: FormDataEntryValue | null) => String(v ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();

export async function startResearch(formData: FormData) {
  await act("/admin/research", formData, async () => {
    const editor = await requireRole("EDITOR");
    if (!env.aiEnabled) throw new Error("Set ANTHROPIC_API_KEY to enable the research desk.");
    const input = str(formData.get("input")).slice(0, 2000);
    const topicSlug = str(formData.get("topic")) || null;
    if (input.length < 15) throw new Error("Describe the claim to research in at least 15 characters.");
    if (!(await rateLimit(LIMITS.researchPerUser, editor.id))) throw new Error("Daily research limit reached.");
    const job = await prisma.researchJob.create({ data: { createdById: editor.id, input, topicSlug, model: env.aiModel } });
    await audit(editor.id, "research.start", "ResearchJob", job.id, { input });
    after(() => runResearchJob(job.id));
    redirect(`/admin/research/${job.id}`);
  });
}

export async function acceptResearch(formData: FormData) {
  await act((fd) => `/admin/research/${str(fd.get("jobId"))}`, formData, async () => {
    const editor = await requireRole("EDITOR");
    const jobId = str(formData.get("jobId"));
    const topic = str(formData.get("topic"));
    const selected = formData.getAll("evidence").map((v) => Number(v)).filter((n) => Number.isInteger(n) && n >= 0);
    const claimId = await acceptResearchJob(jobId, editor, topic, selected);
    redirect(`/admin/claims/${claimId}`);
  });
}

export async function discardResearch(formData: FormData) {
  await act("/admin/research", formData, async () => {
    const editor = await requireRole("EDITOR");
    const jobId = str(formData.get("jobId"));
    await prisma.researchJob.update({ where: { id: jobId }, data: { status: "DISCARDED" } });
    await audit(editor.id, "research.discard", "ResearchJob", jobId);
    redirect("/admin/research");
  });
}

export async function retryResearch(formData: FormData) {
  await act((fd) => `/admin/research/${str(fd.get("jobId"))}`, formData, async () => {
    const editor = await requireRole("EDITOR");
    const jobId = str(formData.get("jobId"));
    await prisma.researchJob.updateMany({ where: { id: jobId, status: { in: ["FAILED", "RUNNING"] } }, data: { status: "QUEUED", error: null } });
    await audit(editor.id, "research.retry", "ResearchJob", jobId);
    after(() => runResearchJob(jobId));
    revalidatePath(`/admin/research/${jobId}`);
  });
}

const TRACKED = ["status", "reason", "proposition", "scope", "statusRationale"] as const;

export async function saveClaim(formData: FormData) {
  await act((fd) => `/admin/claims/${str(fd.get("id"))}`, formData, async () => {
    const editor = await requireRole("EDITOR");
    const id = str(formData.get("id"));
    const claim = await prisma.claim.findUniqueOrThrow({ where: { id } });
    const status = str(formData.get("status")) as ClaimStatus;
    const reason = str(formData.get("reason")) as ReasonCode;
    if (!ALLOWED_REASONS[status]?.includes(reason)) throw new Error(`Reason ${reason} cannot justify ${status}.`);
    const data = {
      headline: str(formData.get("headline")),
      proposition: str(formData.get("proposition")),
      kind: str(formData.get("kind")) as ClaimKind,
      status,
      reason,
      statusRationale: str(formData.get("statusRationale")),
      scope: str(formData.get("scope")),
      summary: str(formData.get("summary")),
      decomposition: lines(formData.get("decomposition")),
      established: lines(formData.get("established")),
      contested: lines(formData.get("contested")),
      counterevidence: lines(formData.get("counterevidence")),
      missingEvidence: lines(formData.get("missingEvidence")),
    };
    if (data.proposition.length < 30 || !data.statusRationale || !data.scope) throw new Error("Proposition (30+ chars), rationale and scope are required.");

    const changed = TRACKED.filter((f) => claim[f] !== data[f]);
    const correctionReason = str(formData.get("correctionReason"));
    if (claim.publishStatus === "PUBLISHED" && changed.length && correctionReason.length < 10) {
      throw new Error("Changing a published claim requires a public reason for the correction.");
    }
    await prisma.$transaction(async (tx) => {
      await tx.claim.update({
        where: { id },
        data: { ...data, ...(claim.publishStatus === "PUBLISHED" && changed.length ? { version: { increment: 1 }, lastReviewedAt: new Date() } : {}) },
      });
      if (claim.publishStatus === "PUBLISHED") {
        for (const f of changed) {
          await tx.correction.create({
            data: { claimId: id, field: f, before: claim[f] as Prisma.InputJsonValue, after: data[f] as Prisma.InputJsonValue, summary: `${f} updated on ${claim.code}`, reason: correctionReason, approvedById: editor.id },
          });
        }
      }
    });
    await audit(editor.id, "claim.save", "Claim", id, { changed: [...changed] });
    revalidatePath(`/admin/claims/${id}`);
    revalidatePath(`/claims/${claim.slug}`);
  });
}

export async function setEvidence(formData: FormData) {
  await act((fd) => `/admin/claims/${str(fd.get("claimId"))}`, formData, async () => {
    const editor = await requireRole("EDITOR");
    const id = str(formData.get("evidenceId"));
    const op = str(formData.get("op"));
    const ev = await prisma.evidenceLink.findUniqueOrThrow({ where: { id }, include: { claim: true } });
    if (op === "approve") await prisma.evidenceLink.update({ where: { id }, data: { approved: true } });
    else if (op === "unapprove") await prisma.evidenceLink.update({ where: { id }, data: { approved: false } });
    else if (op === "verifyQuote") await prisma.evidenceLink.update({ where: { id }, data: { quoteVerified: true, reviewerNote: `Quote verified by hand by ${editor.email}` } });
    else if (op === "removeQuote") await prisma.evidenceLink.update({ where: { id }, data: { quote: null, quoteVerified: false } });
    else if (op === "delete") {
      if (ev.claim.publishStatus === "PUBLISHED") {
        await prisma.correction.create({ data: { claimId: ev.claimId, field: "evidence", before: { sourceId: ev.sourceId, relation: ev.relation }, summary: `Evidence removed from ${ev.claim.code}`, reason: str(formData.get("reason")) || "Removed by editor", approvedById: editor.id } });
      }
      await prisma.evidenceLink.delete({ where: { id } });
    }
    await audit(editor.id, `evidence.${op}`, "EvidenceLink", id);
    revalidatePath(`/admin/claims/${ev.claimId}`);
  });
}

export async function transitionClaim(formData: FormData) {
  await act((fd) => `/admin/claims/${str(fd.get("id"))}`, formData, async () => {
    const editor = await requireRole("EDITOR");
    const id = str(formData.get("id"));
    const to = str(formData.get("to"));
    const claim = await prisma.claim.findUniqueOrThrow({ where: { id } });
    if (to === "IN_REVIEW") {
      if (claim.publishStatus !== "DRAFT") throw new Error("Only drafts can be submitted.");
      await prisma.claim.update({ where: { id }, data: { publishStatus: "IN_REVIEW" } });
    } else if (to === "PUBLISHED") {
      const blockers = await publicationBlockers(id, editor);
      if (blockers.length) throw new Error(blockers.join(" "));
      await prisma.claim.update({ where: { id }, data: { publishStatus: "PUBLISHED", publishedAt: new Date(), publishedById: editor.id, lastReviewedAt: new Date() } });
    } else if (to === "DRAFT") {
      if (claim.publishStatus === "PUBLISHED") throw new Error("Published claims are archived, not returned to draft.");
      await prisma.claim.update({ where: { id }, data: { publishStatus: "DRAFT" } });
    } else if (to === "ARCHIVED") {
      const reason = str(formData.get("reason"));
      if (claim.publishStatus === "PUBLISHED") {
        if (reason.length < 10) throw new Error("Archiving a published claim requires a public reason.");
        await prisma.correction.create({ data: { claimId: id, field: "publishStatus", before: "PUBLISHED", after: "ARCHIVED", summary: `${claim.code} withdrawn`, reason, approvedById: editor.id } });
      }
      await prisma.claim.update({ where: { id }, data: { publishStatus: "ARCHIVED" } });
    } else throw new Error("Unknown transition.");
    await audit(editor.id, `claim.${to.toLowerCase()}`, "Claim", id);
    revalidatePath(`/admin/claims/${id}`);
    revalidatePath(`/claims/${claim.slug}`);
  });
}

export async function resolveReport(formData: FormData) {
  await act("/admin/reports", formData, async () => {
    const reviewer = await requireRole("REVIEWER");
    const id = str(formData.get("id"));
    const status = str(formData.get("status"));
    const resolution = str(formData.get("resolution"));
    if (status !== "ACCEPTED" && status !== "REJECTED") throw new Error("Invalid status.");
    if (resolution.length < 10) throw new Error("Give the reason for this decision (shared with the submitter's record).");
    const report = await prisma.report.findUniqueOrThrow({ where: { id }, include: { claim: true } });
    if (report.claim?.draftedById && report.claim.draftedById === reviewer.id && env.requireSecondReviewer) {
      throw new Error("A challenge must be decided by someone who did not draft the dossier.");
    }
    await prisma.report.update({ where: { id }, data: { status, resolution, resolvedById: reviewer.id, resolvedAt: new Date() } });
    await audit(reviewer.id, `report.${status.toLowerCase()}`, "Report", id, { resolution });
    revalidatePath("/admin/reports");
  });
}

export async function setUserRole(formData: FormData) {
  await act("/admin/users", formData, async () => {
    const admin = await requireRole("ADMIN");
    const email = str(formData.get("email")).toLowerCase();
    const role = str(formData.get("role")) as Role;
    if (!["USER", "REVIEWER", "EDITOR", "ADMIN"].includes(role)) throw new Error("Invalid role.");
    const user = await prisma.user.update({ where: { email }, data: { role } });
    await audit(admin.id, "user.role", "User", user.id, { role });
    revalidatePath("/admin/users");
  });
}

export async function setUserBan(formData: FormData) {
  await act("/admin/users", formData, async () => {
    const admin = await requireRole("ADMIN");
    const id = str(formData.get("id"));
    const banned = str(formData.get("banned")) === "true";
    if (id === admin.id) throw new Error("You cannot ban yourself.");
    await prisma.user.update({ where: { id }, data: { banned } });
    if (banned) await prisma.session.deleteMany({ where: { userId: id } });
    await audit(admin.id, banned ? "user.ban" : "user.unban", "User", id);
    revalidatePath("/admin/users");
  });
}
