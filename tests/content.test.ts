import { describe, expect, it } from "vitest";
import { topics } from "@content/index";
import { ALLOWED_REASONS, parseSeedDate, validateClaim, validateTopics } from "@/lib/content-validate";

describe("launch content", () => {
  it("passes validation with no errors", () => {
    const errors = validateTopics(topics).filter((i) => i.level === "error");
    expect(errors).toEqual([]);
  });

  it("covers at least ten topics and thirty claims", () => {
    expect(topics.length).toBeGreaterThanOrEqual(10);
    expect(topics.flatMap((t) => t.claims).length).toBeGreaterThanOrEqual(30);
  });

  it("uses each main label at least once", () => {
    const statuses = new Set(topics.flatMap((t) => t.claims.map((c) => c.status)));
    expect([...statuses].sort()).toEqual(["DISPUTED", "UNVERIFIED", "WIDELY_AGREED"]);
  });

  it("never states vote results in editorial content", () => {
    const text = JSON.stringify(topics);
    expect(text).not.toMatch(/\d+% of (users|voters|participants)/i);
  });

  it("gives every disputed claim counterevidence", () => {
    for (const c of topics.flatMap((t) => t.claims).filter((c) => c.status === "DISPUTED")) {
      expect(c.counterevidence.length + c.evidence.filter((e) => e.relation === "CONTRADICTS").length, c.slug).toBeGreaterThan(0);
    }
  });
});

describe("validateClaim", () => {
  const base = topics[0].claims[0];
  const sources = new Set(topics[0].sources.map((s) => s.slug));
  it("rejects a reason that cannot justify the label", () => {
    const issues = validateClaim({ ...base, status: "WIDELY_AGREED", reason: "INSUFFICIENT_EVIDENCE" }, sources, "x");
    expect(issues.some((i) => i.level === "error" && i.message.includes("cannot justify"))).toBe(true);
  });
  it("rejects unknown sources", () => {
    const issues = validateClaim({ ...base, evidence: [{ source: "nope", relation: "SUPPORTS", establishes: "x" }] }, sources, "x");
    expect(issues.some((i) => i.message.includes("unknown source"))).toBe(true);
  });
  it("keeps Unverified distinct from Contradicted", () => {
    expect(ALLOWED_REASONS.UNVERIFIED).not.toContain("CONTRADICTED");
  });
});

describe("parseSeedDate", () => {
  it("infers precision", () => {
    expect(parseSeedDate("2024").precision).toBe("YEAR");
    expect(parseSeedDate("2024-07").precision).toBe("MONTH");
    expect(parseSeedDate("2024-07-19")).toEqual({ date: new Date(Date.UTC(2024, 6, 19)), precision: "DAY" });
  });
});
