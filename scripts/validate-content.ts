import { topics } from "../content";
import { validateTopics } from "../src/lib/content-validate";

const issues = validateTopics(topics);
for (const i of issues) console.log(`${i.level.toUpperCase().padEnd(7)} ${i.where}: ${i.message}`);
const errors = issues.filter((i) => i.level === "error").length;
const claims = topics.reduce((n, t) => n + t.claims.length, 0);
const sources = topics.reduce((n, t) => n + t.sources.length, 0);
console.log(`\n${topics.length} topics, ${claims} claims, ${sources} sources — ${errors} errors, ${issues.length - errors} warnings`);
process.exit(errors ? 1 : 0);
