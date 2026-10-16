import { NextResponse } from "next/server";
import type { ReportKind } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sameOrigin } from "@/lib/request";
import { LIMITS, rateLimit } from "@/lib/rate-limit";

const KINDS: ReportKind[] = ["CORRECTION", "COUNTEREVIDENCE", "MISSING_SOURCE", "SOURCE_MISREPRESENTED", "ABUSE", "OTHER"];

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Cross-site request rejected." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to submit." }, { status: 401 });
  if (!(await rateLimit(LIMITS.reportPerUser, user.id))) return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });

  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const kind = KINDS.includes(b?.kind as ReportKind) ? (b!.kind as ReportKind) : null;
  const body = typeof b?.body === "string" ? b.body.trim() : "";
  const url = typeof b?.url === "string" && b.url ? b.url.trim() : null;
  if (!kind || body.length < 20 || body.length > 5000) return NextResponse.json({ error: "Please describe the issue in 20–5000 characters." }, { status: 400 });
  if (url && (!/^https?:\/\//.test(url) || url.length > 2000)) return NextResponse.json({ error: "The link must start with http(s)://" }, { status: 400 });

  const claimId = typeof b?.claimId === "string" ? b.claimId : null;
  const sourceId = typeof b?.sourceId === "string" ? b.sourceId : null;
  if (claimId && !(await prisma.claim.findUnique({ where: { id: claimId }, select: { id: true } }))) return NextResponse.json({ error: "Unknown claim." }, { status: 400 });
  if (sourceId && !(await prisma.source.findUnique({ where: { id: sourceId }, select: { id: true } }))) return NextResponse.json({ error: "Unknown source." }, { status: 400 });

  await prisma.report.create({ data: { kind, body, url, claimId, sourceId, userId: user.id } });
  return NextResponse.json({ ok: true });
}
