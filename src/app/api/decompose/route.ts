import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { sameOrigin } from "@/lib/request";
import { LIMITS, rateLimit } from "@/lib/rate-limit";
import { decomposeClaim } from "@/lib/ai/decompose";
import { relatedClaims } from "@/lib/queries";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Cross-site request rejected." }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to use the claim checker." }, { status: 401 });
  const b = (await req.json().catch(() => null)) as { text?: unknown } | null;
  const text = typeof b?.text === "string" ? b.text.trim() : "";
  if (text.length < 10 || text.length > 2000) return NextResponse.json({ error: "Paste a claim between 10 and 2000 characters." }, { status: 400 });

  const related = await relatedClaims(text);
  const relatedOut = related.map((c) => ({ slug: c.slug, code: c.code, headline: c.headline, status: c.status, topic: c.topic.title }));
  if (!env.aiEnabled) return NextResponse.json({ decomposition: null, related: relatedOut, aiEnabled: false });
  if (!(await rateLimit(LIMITS.decomposePerUser, user.id))) return NextResponse.json({ error: "Daily limit reached. Try again tomorrow.", related: relatedOut }, { status: 429 });

  try {
    const decomposition = await decomposeClaim(text);
    return NextResponse.json({ decomposition, related: relatedOut, aiEnabled: true });
  } catch (e) {
    console.error("decompose failed", e);
    return NextResponse.json({ error: "The claim checker is unavailable right now.", related: relatedOut }, { status: 502 });
  }
}
