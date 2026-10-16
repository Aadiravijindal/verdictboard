import { describe, expect, it } from "vitest";
import { breakdown, computeResults, evidenceImpact, parseVoteInput, wilson, type VoteRow } from "@/lib/votes";

const day = 86400_000;
const t0 = new Date("2026-01-01T00:00:00Z");

function row(i: number, over: Partial<VoteRow> = {}): VoteRow {
  return {
    userId: `u${i}`, phase: "AFTER", stance: "AGREE", confidence: 60,
    createdAt: new Date(t0.getTime() + 30 * day), accountCreatedAt: t0, country: null, leaning: null, ...over,
  };
}

describe("wilson", () => {
  it("returns a zero-width interval with no data", () => expect(wilson(0, 0)).toEqual({ low: 0, high: 0 }));
  it("brackets the observed share", () => {
    const { low, high } = wilson(30, 100);
    expect(low).toBeLessThan(0.3);
    expect(high).toBeGreaterThan(0.3);
    expect(low).toBeGreaterThan(0.2);
    expect(high).toBeLessThan(0.4);
  });
});

describe("breakdown", () => {
  it("counts every stance including Unsure", () => {
    const b = breakdown([{ stance: "AGREE", confidence: 80 }, { stance: "UNSURE", confidence: 20 }]);
    expect(b.n).toBe(2);
    expect(b.shares.find((s) => s.stance === "UNSURE")!.share).toBe(0.5);
    expect(b.meanConfidence).toBe(50);
  });
});

describe("computeResults", () => {
  it("hides subgroups below the minimum size", () => {
    const rows = [
      ...Array.from({ length: 5 }, (_, i) => row(i, { country: "India" })),
      ...Array.from({ length: 2 }, (_, i) => row(100 + i, { country: "Israel" })),
    ];
    const r = computeResults(rows, "AFTER", 5);
    expect(r.byCountry.map((g) => g.label)).toEqual(["India"]);
    expect(r.suppressedGroups).toBe(1);
  });

  it("separates votes from new accounts", () => {
    const rows = [row(1), row(2, { accountCreatedAt: new Date(t0.getTime() + 29 * day) })];
    const r = computeResults(rows, "AFTER", 5);
    expect(r.all.n).toBe(2);
    expect(r.establishedAccounts.n).toBe(1);
  });

  it("only counts the requested phase", () => {
    const r = computeResults([row(1), row(2, { phase: "BEFORE" })], "AFTER", 5);
    expect(r.all.n).toBe(1);
  });
});

describe("evidenceImpact", () => {
  it("requires enough paired respondents", () => {
    expect(evidenceImpact([row(1, { phase: "BEFORE" }), row(1)], 5)).toBeNull();
  });
  it("measures the share who changed their answer", () => {
    const rows: VoteRow[] = [];
    for (let i = 0; i < 10; i++) {
      rows.push(row(i, { phase: "BEFORE", stance: "UNSURE", confidence: 30 }));
      rows.push(row(i, { phase: "AFTER", stance: i < 4 ? "AGREE" : "UNSURE", confidence: 70 }));
    }
    const imp = evidenceImpact(rows, 5)!;
    expect(imp.pairedN).toBe(10);
    expect(imp.changedShare).toBeCloseTo(0.4);
    expect(imp.transitions.UNSURE.AGREE).toBe(4);
    expect(imp.meanConfidenceAfter).toBeGreaterThan(imp.meanConfidenceBefore);
  });
});

describe("parseVoteInput", () => {
  it("accepts a valid vote", () => expect(parseVoteInput({ phase: "AFTER", stance: "UNSURE", confidence: 55 })).toEqual({ phase: "AFTER", stance: "UNSURE", confidence: 55 }));
  it.each([
    { phase: "DURING", stance: "AGREE", confidence: 5 },
    { phase: "AFTER", stance: "MAYBE", confidence: 5 },
    { phase: "AFTER", stance: "AGREE", confidence: 101 },
    { phase: "AFTER", stance: "AGREE", confidence: 4.5 },
    null,
  ])("rejects %j", (input) => expect(parseVoteInput(input)).toBeNull());
});
