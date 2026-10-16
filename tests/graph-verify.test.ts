import { describe, expect, it } from "vitest";
import { groupByOrigin } from "@/lib/graph";
import { addToCorpus, checkEvidence, emptyCorpus, normalizeUrl, quoteAppearsIn } from "@/lib/ai/verify";

describe("groupByOrigin", () => {
  const s = (id: string, derivedFromId: string | null = null) => ({ id, title: id, publisher: id, derivedFromId });
  it("treats repeated reporting as one origin", () => {
    const wire = s("wire");
    const groups = groupByOrigin([s("a", "wire"), s("b", "wire"), s("c")], [wire]);
    expect(groups).toHaveLength(2);
    expect(groups.find((g) => g.origin.id === "wire")!.repeats.map((r) => r.id)).toEqual(["a", "b"]);
  });
  it("follows chains and survives cycles", () => {
    const groups = groupByOrigin([s("x", "y"), s("y", "x")], []);
    expect(groups.length).toBeGreaterThanOrEqual(1);
  });
});

describe("grounding checks", () => {
  it("normalises URLs", () => {
    expect(normalizeUrl("https://www.Example.org/a/?utm_source=x#frag")).toBe("example.org/a");
  });
  it("matches quotes despite typographic differences", () => {
    expect(quoteAppearsIn("It is “unequivocal” that human influence", ["...It is \"unequivocal\"   that human influence has warmed..."])).toBe(true);
    expect(quoteAppearsIn("short", ["short"])).toBe(false);
  });
  it("flags URLs that were never retrieved and quotes not in the text", () => {
    const c = emptyCorpus();
    addToCorpus(c, "https://court.example/judgment", "The Court finds that the measures are required.");
    expect(checkEvidence(c, "https://court.example/judgment", "the measures are required")).toEqual({ urlSeen: true, quoteVerified: true });
    expect(checkEvidence(c, "https://court.example/judgment", "the Court finds genocide")).toEqual({ urlSeen: true, quoteVerified: false });
    expect(checkEvidence(c, "https://invented.example/x", "")).toEqual({ urlSeen: false, quoteVerified: false });
  });
});
