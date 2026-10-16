import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Public, free index of published claims. Vote data is deliberately excluded. */
export async function GET() {
  const claims = await prisma.claim.findMany({
    where: { publishStatus: "PUBLISHED" },
    include: { topic: { select: { slug: true, title: true } } },
    orderBy: { code: "asc" },
  });
  return NextResponse.json(
    {
      license: "CC BY 4.0 — attribute VerdictBoard and link to the dossier",
      generatedAt: new Date().toISOString(),
      claims: claims.map((c) => ({
        code: c.code, slug: c.slug, url: `${env.appUrl}/claims/${c.slug}`, record: `${env.appUrl}/api/public/claims/${c.slug}`,
        topic: c.topic, headline: c.headline, proposition: c.proposition, kind: c.kind, status: c.status, reason: c.reason,
        version: c.version, lastReviewedAt: c.lastReviewedAt,
      })),
    },
    { headers: { "cache-control": "public, max-age=300", "access-control-allow-origin": "*" } },
  );
}
