import { NextResponse } from "next/server";
import { consumeLoginToken } from "@/lib/auth";
import { env } from "@/lib/env";
import { sameOrigin } from "@/lib/request";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Cross-site request rejected." }, { status: 403 });
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const next = String(form.get("next") ?? "/");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const user = token ? await consumeLoginToken(token) : null;
  if (!user) return NextResponse.redirect(`${env.appUrl}/login?error=expired`, { status: 303 });
  return NextResponse.redirect(`${env.appUrl}${safeNext}`, { status: 303 });
}
