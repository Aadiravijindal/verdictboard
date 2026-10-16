import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { clientIp, sameOrigin } from "@/lib/request";
import { LIMITS, rateLimit } from "@/lib/rate-limit";
import { castVote, parseVoteInput } from "@/lib/votes";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Cross-site request rejected." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to vote." }, { status: 401 });
  if (!user.emailVerifiedAt) return NextResponse.json({ error: "Verify your email to vote." }, { status: 403 });

  const ip = await clientIp();
  if (!(await rateLimit(LIMITS.votePerUser, user.id)) || !(await rateLimit(LIMITS.votePerIp, ip))) {
    return NextResponse.json({ error: "Too many votes in a short time. Try again later." }, { status: 429 });
  }

  const input = parseVoteInput(await req.json().catch(() => null));
  if (!input) return NextResponse.json({ error: "Invalid vote." }, { status: 400 });

  const { slug } = await params;
  const claim = await prisma.claim.findFirst({ where: { slug, publishStatus: "PUBLISHED" }, select: { id: true } });
  if (!claim) return NextResponse.json({ error: "Claim not found." }, { status: 404 });

  const vote = await castVote(user.id, claim.id, input.phase, input.stance, input.confidence);
  return NextResponse.json({ ok: true, vote: { phase: vote.phase, stance: vote.stance, confidence: vote.confidence } });
}
