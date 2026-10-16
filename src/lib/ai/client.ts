import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env";

let client: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (!env.aiEnabled) throw new Error("AI features are disabled: set ANTHROPIC_API_KEY to enable them.");
  client ??= new Anthropic();
  return client;
}

/**
 * Server-side refusal fallback: if the primary model declines a request for
 * policy reasons, the API re-runs it on Anthropic's recommended fallback model.
 * Political-violence and war-crimes research can occasionally trip classifiers.
 */
export const FALLBACK = { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const };

/** Shared ground rules for every model call. Kept stable so it caches well. */
export const EDITORIAL_RULES = `You support VerdictBoard, a non-partisan platform that traces political claims to primary evidence.

Non-negotiable rules:
- Apply the same evidentiary standard to every actor: governments, opposition parties, militaries, armed groups, companies, activists.
- Separate three layers: (A) what evidence establishes, (B) what it means (interpretation), (C) what people believe. Never treat popularity as evidence.
- Prefer primary sources: court records, legislation, official data and records, original reports by investigating bodies. Then independent original reporting. Treat advocacy and party statements as the positions of interested parties.
- Ten articles repeating one press release are one source, not ten. Identify the original.
- Do not manufacture symmetry. If the evidence overwhelmingly supports one conclusion, say so, and still present the strongest credible counterevidence.
- Missing evidence is not disproof. Say what evidence would settle the question.
- Never present an allegation, indictment, arrest warrant, advisory opinion or advocacy group's legal argument as a final legal finding.
- Every casualty or statistical figure needs its source, date, scope and definition.
- Never invent sources, URLs, quotes, dates or numbers. If you cannot find something, say so.`;
