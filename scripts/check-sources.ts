// Checks that every source URL in the seed content resolves. Run before each
// release and on a schedule; results are written to .source-check.json and, when
// DATABASE_URL is set, to Source.lastHttpStatus / lastCheckedAt.
import { writeFileSync } from "node:fs";
import { topics } from "../content";
import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";

// Respect HTTPS_PROXY / NO_PROXY when running behind a proxy (CI, sandboxes).
if (process.env.HTTPS_PROXY || process.env.https_proxy) setGlobalDispatcher(new EnvHttpProxyAgent());

const UA = "VerdictBoardSourceChecker/1.0 (+https://verdictboard.org/methodology)";

async function check(url: string): Promise<number> {
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const res = await fetch(url, { method, redirect: "follow", headers: { "user-agent": UA, accept: "text/html,application/pdf,*/*" }, signal: AbortSignal.timeout(20000) });
      if (res.status < 400 || method === "GET") return res.status;
    } catch {
      if (method === "GET") return 0;
    }
  }
  return 0;
}

async function main() {
  const all = topics.flatMap((t) => t.sources.map((s) => ({ topic: t.slug, slug: s.slug, url: s.url })));
  const results: { topic: string; slug: string; url: string; status: number }[] = [];
  const queue = [...all];
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let item = queue.shift(); item; item = queue.shift()) {
        const status = await check(item.url);
        results.push({ ...item, status });
        const mark = status >= 200 && status < 400 ? "ok " : status === 403 || status === 429 ? "?? " : "BAD";
        console.log(`${mark} ${String(status).padStart(3)} ${item.slug} ${item.url}`);
      }
    }),
  );
  writeFileSync(".source-check.json", JSON.stringify(results, null, 2));

  if (process.env.DATABASE_URL) {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    for (const r of results) {
      await prisma.source.updateMany({ where: { slug: r.slug }, data: { lastHttpStatus: r.status, lastCheckedAt: new Date() } });
    }
    await prisma.$disconnect();
  }
  const broken = results.filter((r) => r.status === 0 || r.status === 404 || r.status === 410);
  console.log(`\n${results.length} checked, ${broken.length} broken (403/429 usually mean the site blocks automated checks).`);
  process.exit(broken.length ? 1 : 0);
}

main();
