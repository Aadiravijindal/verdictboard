import * as z from "zod/v4";

export const ClaimKindZ = z.enum(["FACTUAL", "CAUSAL", "RESPONSIBILITY", "LEGAL", "VALUE"]);

export const DecompositionZ = z.object({
  checkable: z.boolean().describe("False if the input is purely a value judgement or too vague to test."),
  normalizedProposition: z.string().describe("The most precise, neutral, testable restatement of the claim."),
  kind: ClaimKindZ,
  splitInto: z.array(z.object({ proposition: z.string(), kind: ClaimKindZ })).describe("If the input bundles several claims (e.g. an event, its cause and its justification), list them separately."),
  questions: z.array(z.string()).describe("Precise sub-questions that would need answers to assess the claim."),
  evidenceNeeded: z.array(z.string()).describe("Types of primary evidence that would settle each question, e.g. 'constituency-level Form 20 results'."),
  ambiguities: z.array(z.string()).describe("Undefined terms, missing dates or places, or loaded wording that must be pinned down."),
});
export type Decomposition = z.infer<typeof DecompositionZ>;

export const SourceTypeZ = z.enum([
  "COURT_RECORD", "LEGISLATION", "OFFICIAL_RECORD", "OFFICIAL_STATEMENT", "OFFICIAL_DATA", "INTERGOVERNMENTAL",
  "INDEPENDENT_INVESTIGATION", "ACADEMIC", "NGO_REPORT", "NEWS_REPORT", "PARTY_STATEMENT", "OTHER",
]);

export const ResearchDraftZ = z.object({
  proposition: z.string(),
  headline: z.string().describe("A short neutral question, e.g. 'What did the ICJ order in January 2024?'"),
  kind: ClaimKindZ,
  suggestedStatus: z.enum(["WIDELY_AGREED", "DISPUTED", "UNVERIFIED"]),
  suggestedReason: z.enum([
    "CONFIRMED_PRIMARY", "CORROBORATED_INDEPENDENT", "PARTIALLY_SUPPORTED", "CONTRADICTED",
    "INSUFFICIENT_EVIDENCE", "LEGAL_UNRESOLVED", "INTERPRETATION_DISPUTED", "OUTDATED",
  ]),
  statusRationale: z.string(),
  scope: z.string(),
  summary: z.string(),
  decomposition: z.array(z.string()),
  established: z.array(z.string()),
  contested: z.array(z.string()),
  counterevidence: z.array(z.string()),
  missingEvidence: z.array(z.string()),
  sources: z.array(
    z.object({
      url: z.string(),
      title: z.string(),
      publisher: z.string(),
      publishedAt: z.string().describe("ISO date (YYYY-MM-DD, YYYY-MM or YYYY), or empty if unknown."),
      sourceType: SourceTypeZ,
      isPrimary: z.boolean(),
      repeatsUrl: z.string().describe("If this source only repeats another source in this list, that source's URL; otherwise empty."),
      limitations: z.string(),
    }),
  ),
  evidence: z.array(
    z.object({
      url: z.string().describe("Must be one of the sources' URLs."),
      relation: z.enum(["SUPPORTS", "PARTIALLY_SUPPORTS", "CONTRADICTS", "CONTEXT"]),
      establishes: z.string().describe("What this source establishes for the claim — only what it actually says."),
      quote: z.string().describe("Exact text copied from the source that supports 'establishes', or empty if none was read."),
      locator: z.string().describe("Page, paragraph or section, or empty."),
    }),
  ),
  reviewerWarnings: z.array(z.string()).describe("Anything a human editor must check: weak sourcing, legal sensitivity, named individuals, figures that change over time."),
});
export type ResearchDraft = z.infer<typeof ResearchDraftZ>;
