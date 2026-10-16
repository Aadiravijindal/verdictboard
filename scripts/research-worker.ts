// Processes queued or stuck research jobs. Run from cron or a long-lived worker
// when the hosting platform limits background work after a response.
//   npm run research:worker
import { prisma } from "../src/lib/db";
import { runResearchJob } from "../src/lib/research-jobs";

async function main() {
  const stuckBefore = new Date(Date.now() - 30 * 60_000);
  await prisma.researchJob.updateMany({ where: { status: "RUNNING", createdAt: { lt: stuckBefore } }, data: { status: "QUEUED" } });
  const jobs = await prisma.researchJob.findMany({ where: { status: "QUEUED" }, orderBy: { createdAt: "asc" }, take: 5 });
  for (const j of jobs) {
    console.log(`Running ${j.id}: ${j.input.slice(0, 80)}`);
    await runResearchJob(j.id);
  }
  await prisma.$disconnect();
}

main();
