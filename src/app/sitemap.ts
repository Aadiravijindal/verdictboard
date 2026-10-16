import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [topics, claims] = await Promise.all([
    prisma.topic.findMany({ where: { publishStatus: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.claim.findMany({ where: { publishStatus: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);
  const base = env.appUrl;
  return [
    ...["", "/topics", "/claims", "/methodology", "/corrections", "/ai-policy", "/about"].map((p) => ({ url: `${base}${p}` })),
    ...topics.map((t) => ({ url: `${base}/topics/${t.slug}`, lastModified: t.updatedAt })),
    ...claims.map((c) => ({ url: `${base}/claims/${c.slug}`, lastModified: c.updatedAt })),
  ];
}
