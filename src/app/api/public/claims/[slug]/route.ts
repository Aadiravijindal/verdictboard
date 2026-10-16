import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Full evidence record for one claim: assessment, evidence with provenance, and corrections. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await prisma.claim.findFirst({
    where: { slug, publishStatus: "PUBLISHED" },
    include: {
      topic: { select: { slug: true, title: true } },
      evidence: { where: { approved: true }, orderBy: { sortOrder: "asc" }, include: { source: { include: { derivedFrom: { select: { slug: true } } } } } },
      corrections: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(
    {
      license: "CC BY 4.0",
      url: `${env.appUrl}/claims/${c.slug}`,
      code: c.code, topic: c.topic, headline: c.headline, proposition: c.proposition, kind: c.kind,
      assessment: { status: c.status, reason: c.reason, rationale: c.statusRationale, scope: c.scope, lastReviewedAt: c.lastReviewedAt, version: c.version, aiAssisted: c.aiAssisted },
      summary: c.summary, decomposition: c.decomposition, established: c.established, contested: c.contested,
      counterevidence: c.counterevidence, missingEvidence: c.missingEvidence, variants: c.variants,
      evidence: c.evidence.map((e) => ({
        relation: e.relation, establishes: e.establishes, locator: e.locator, quote: e.quote, quoteVerified: e.quoteVerified, aiGenerated: e.aiGenerated,
        source: {
          slug: e.source.slug, title: e.source.title, publisher: e.source.publisher, author: e.source.author, url: e.source.url,
          publishedAt: e.source.publishedAt, type: e.source.sourceType, isPrimary: e.source.isPrimary, limitations: e.source.limitations,
          repeats: e.source.derivedFrom?.slug ?? null,
        },
      })),
      corrections: c.corrections.map((x) => ({ date: x.createdAt, field: x.field, summary: x.summary, reason: x.reason, before: x.before, after: x.after })),
    },
    { headers: { "cache-control": "public, max-age=300", "access-control-allow-origin": "*", "content-disposition": `inline; filename="${c.code}.json"` } },
  );
}
