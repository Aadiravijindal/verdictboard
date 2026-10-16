import { cache } from "react";
import { prisma } from "./db";

export const published = { publishStatus: "PUBLISHED" as const };

export const getTopics = cache(() =>
  prisma.topic.findMany({
    where: published,
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { claims: { where: published }, events: true } } },
  }),
);

export const getTopic = cache((slug: string) =>
  prisma.topic.findFirst({
    where: { slug, ...published },
    include: {
      events: { orderBy: { date: "asc" }, include: { sources: { include: { source: true } } } },
      claims: { where: published, orderBy: { code: "asc" }, include: { _count: { select: { evidence: true } } } },
      perspectives: { orderBy: { sortOrder: "asc" }, include: { sources: { include: { source: true } } } },
    },
  }),
);

export const getClaim = cache((slug: string) =>
  prisma.claim.findFirst({
    where: { slug, ...published },
    include: {
      topic: true,
      evidence: { where: { approved: true }, orderBy: { sortOrder: "asc" }, include: { source: { include: { derivedFrom: true } } } },
      corrections: { orderBy: { createdAt: "desc" } },
      perspectives: true,
    },
  }),
);

export function searchPublished(q: string) {
  const term = q.trim().slice(0, 200);
  if (!term) return Promise.resolve({ claims: [], topics: [], sources: [] });
  const contains = { contains: term, mode: "insensitive" as const };
  return Promise.all([
    prisma.claim.findMany({
      where: { ...published, OR: [{ proposition: contains }, { headline: contains }, { summary: contains }, { code: contains }] },
      include: { topic: true },
      take: 30,
    }),
    prisma.topic.findMany({ where: { ...published, OR: [{ title: contains }, { summary: contains }, { overview: contains }] }, take: 10 }),
    prisma.source.findMany({ where: { OR: [{ title: contains }, { publisher: contains }] }, take: 20 }),
  ]).then(([claims, topics, sources]) => ({ claims, topics, sources }));
}

/** Finds published claims sharing the most significant words with a text. */
export async function relatedClaims(text: string, take = 5) {
  const stop = new Set("the a an of to in on and or is was were be by for with that this from as at it its are has have had not did does".split(" "));
  const words = [...new Set(text.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) ?? [])].filter((w) => !stop.has(w)).slice(0, 12);
  if (!words.length) return [];
  const candidates = await prisma.claim.findMany({
    where: { ...published, OR: words.map((w) => ({ proposition: { contains: w, mode: "insensitive" as const } })) },
    include: { topic: true },
    take: 50,
  });
  return candidates
    .map((c) => ({ c, score: words.filter((w) => c.proposition.toLowerCase().includes(w) || c.headline.toLowerCase().includes(w)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, take)
    .map((x) => x.c);
}
