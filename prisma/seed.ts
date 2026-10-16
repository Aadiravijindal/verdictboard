// Loads the reviewed content in /content into the database.
//
// Content in the repository is the editorial source of truth for launch topics.
// Re-running the seed updates records in place, and whenever a published claim's
// label, reason, proposition or scope changes, a public Correction is recorded so
// the change is never silent.
import { PrismaClient, Prisma } from "@prisma/client";
import { topics } from "../content";
import { parseSeedDate, validateTopics } from "../src/lib/content-validate";

const prisma = new PrismaClient();
const TRACKED: ("status" | "reason" | "proposition" | "scope")[] = ["status", "reason", "proposition", "scope"];

async function main() {
  const errors = validateTopics(topics).filter((i) => i.level === "error");
  if (errors.length) {
    for (const e of errors) console.error(`${e.where}: ${e.message}`);
    throw new Error("Content validation failed; nothing was written.");
  }

  for (const t of topics) {
    const reviewed = parseSeedDate(t.lastReviewed).date;
    const topicData = {
      code: t.code, title: t.title, category: t.category, region: t.region, kicker: t.kicker,
      summary: t.summary, overview: t.overview, scope: t.scope, sortOrder: t.sortOrder,
      publishStatus: "PUBLISHED" as const, lastReviewedAt: reviewed,
    };
    const topic = await prisma.topic.upsert({ where: { slug: t.slug }, create: { slug: t.slug, ...topicData }, update: topicData });

    // Sources (two passes so derivedFrom can reference siblings).
    const sourceIds = new Map<string, string>();
    for (const s of t.sources) {
      const data = {
        title: s.title, publisher: s.publisher, author: s.author ?? null, url: s.url,
        publishedAt: s.publishedAt ? parseSeedDate(s.publishedAt).date : null,
        sourceType: s.sourceType, isPrimary: s.isPrimary, description: s.description, limitations: s.limitations ?? null,
      };
      const row = await prisma.source.upsert({ where: { slug: s.slug }, create: { slug: s.slug, ...data }, update: data });
      sourceIds.set(s.slug, row.id);
    }
    for (const s of t.sources) {
      await prisma.source.update({ where: { slug: s.slug }, data: { derivedFromId: s.derivedFrom ? sourceIds.get(s.derivedFrom)! : null } });
    }

    for (const e of t.events) {
      const { date, precision } = parseSeedDate(e.date);
      const data = {
        topicId: topic.id, date, datePrecision: precision, title: e.title, description: e.description,
        certainty: e.certainty ?? "DOCUMENTED", disputeNote: e.disputeNote ?? null, keyEvent: e.keyEvent ?? false,
      };
      const ev = await prisma.event.upsert({ where: { slug: e.slug }, create: { slug: e.slug, ...data }, update: data });
      await prisma.eventSource.deleteMany({ where: { eventId: ev.id } });
      if (e.sources.length) {
        await prisma.eventSource.createMany({ data: e.sources.map((s) => ({ eventId: ev.id, sourceId: sourceIds.get(s)! })) });
      }
    }

    for (const c of t.claims) {
      const data = {
        code: c.code, topicId: topic.id, headline: c.headline, proposition: c.proposition, kind: c.kind,
        status: c.status, reason: c.reason, statusRationale: c.statusRationale, scope: c.scope, summary: c.summary,
        established: c.established, contested: c.contested, counterevidence: c.counterevidence,
        missingEvidence: c.missingEvidence, variants: (c.variants ?? []) as unknown as Prisma.InputJsonValue,
        decomposition: c.decomposition, publishStatus: "PUBLISHED" as const, lastReviewedAt: reviewed,
      };
      const existing = await prisma.claim.findUnique({ where: { slug: c.slug } });
      let claimId: string;
      if (!existing) {
        const row = await prisma.claim.create({ data: { slug: c.slug, ...data, publishedAt: reviewed } });
        claimId = row.id;
      } else {
        const changed = TRACKED.filter((f) => existing[f] !== data[f]);
        const row = await prisma.claim.update({
          where: { id: existing.id },
          data: { ...data, version: changed.length ? existing.version + 1 : existing.version },
        });
        claimId = row.id;
        if (existing.publishStatus === "PUBLISHED") {
          for (const f of changed) {
            await prisma.correction.create({
              data: {
                claimId, field: f, before: existing[f], after: data[f],
                summary: `${f === "status" ? "Label" : f[0].toUpperCase() + f.slice(1)} changed on ${c.code}`,
                reason: "Editorial update from the reviewed content repository.",
              },
            });
          }
        }
      }
      await prisma.evidenceLink.deleteMany({ where: { claimId, aiGenerated: false } });
      await prisma.evidenceLink.createMany({
        data: c.evidence.map((ev, i) => ({
          claimId, sourceId: sourceIds.get(ev.source)!, relation: ev.relation, establishes: ev.establishes,
          locator: ev.locator ?? null, quote: ev.quote ?? null, quoteVerified: false, sortOrder: i, approved: true,
        })),
        skipDuplicates: true,
      });
    }

    for (const p of t.perspectives) {
      const claim = p.claim ? await prisma.claim.findUnique({ where: { slug: p.claim } }) : null;
      const data = {
        topicId: topic.id, claimId: claim?.id ?? null, title: p.title, heldBy: p.heldBy, summary: p.summary,
        arguments: p.arguments, counterarguments: p.counterarguments,
      };
      const row = await prisma.perspective.upsert({ where: { slug: p.slug }, create: { slug: p.slug, ...data }, update: data });
      await prisma.perspectiveSource.deleteMany({ where: { perspectiveId: row.id } });
      if (p.sources.length) {
        await prisma.perspectiveSource.createMany({ data: p.sources.map((s) => ({ perspectiveId: row.id, sourceId: sourceIds.get(s)! })) });
      }
    }
    console.log(`✓ ${t.code} ${t.title}: ${t.claims.length} claims, ${t.events.length} events, ${t.sources.length} sources`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
