import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";
import { env } from "@/lib/env";
import { sameOrigin } from "@/lib/request";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Cross-site request rejected." }, { status: 403 });
  await signOut();
  return NextResponse.redirect(`${env.appUrl}/`, { status: 303 });
}
