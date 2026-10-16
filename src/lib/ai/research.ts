// Editor-only research assistant. It does the tedious work — finding original
// documents, extracting passages, spotting repeated reporting — and produces a
// DRAFT dossier. Drafts are never published automatically: every evidence item
// is checked against what was actually retrieved and must be approved by a
// human editor, and publication requires a second reviewer.
import type Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { anthropic, EDITORIAL_RULES, FALLBACK } from "./client";
import { ResearchDraftZ, type ResearchDraft } from "./schemas";
import { addToCorpus, checkEvidence, emptyCorpus, type EvidenceCheck, type RetrievedCorpus } from "./verify";
import { env } from "../env";

type Block = Anthropic.Beta.BetaContentBlock;

const RESEARCH_INSTRUCTIONS = `You are researching one claim for a VerdictBoard dossier. Work like an investigative researcher:
1. Restate the claim precisely and decompose it into the questions that must be answered (which event, place, date, figure, actor, legal instrument).
2. Search for and open PRIMARY records first: court judgments and orders, statutes, official data and statistical releases, election records, official statements, reports of investigating bodies. Then credible original reporting.
3. For each important point, open the source and copy the exact sentence(s) that support it, with page/paragraph where possible.
4. Look for the strongest credible counterevidence and for official responses from the party the claim concerns.
5. Note when several outlets repeat the same original (press release, wire story, single report) — identify the original.
6. Say clearly what remains unknown and what evidence would settle it.
Finish with a structured research memo listing every source URL you opened, what it establishes, and exact quotes.`;

const STRUCTURE_INSTRUCTIONS = `Convert the research memo into a draft dossier.
Rules: use ONLY sources whose URLs appear in the memo or in the list of retrieved URLs. Copy quotes exactly as they appear in the memo; if no exact quote was recorded, leave quote empty. Choose the label strictly by evidence:
- WIDELY_AGREED: strong evidence and broad agreement on this precise proposition (reasons: CONFIRMED_PRIMARY, CORROBORATED_INDEPENDENT, or CONTRADICTED when the evidence clearly refutes it).
- DISPUTED: material disagreement on facts, interpretation or law (PARTIALLY_SUPPORTED, LEGAL_UNRESOLVED, INTERPRETATION_DISPUTED).
- UNVERIFIED: evidence insufficient (INSUFFICIENT_EVIDENCE, OUTDATED).
Add reviewerWarnings for anything a human must double-check.`;

export interface ResearchResult {
  draft: ResearchDraft;
  checks: EvidenceCheck[];
  memo: string;
  retrievedUrls: string[];
  usage: { inputTokens: number; outputTokens: number; searches: number; fetches: number };
}

function collect(content: Block[], corpus: RetrievedCorpus, counters: { searches: number; fetches: number }) {
  for (const block of content) {
    if (block.type === "web_search_tool_result") {
      counters.searches++;
      if (Array.isArray(block.content)) for (const r of block.content) addToCorpus(corpus, r.url);
    } else if (block.type === "web_fetch_tool_result") {
      counters.fetches++;
      if (block.content.type === "web_fetch_result") {
        const src = block.content.content.source;
        addToCorpus(corpus, block.content.url, src.type === "text" ? src.data : undefined);
      }
    } else if (block.type === "text" && block.citations) {
      for (const c of block.citations) {
        if (c.type === "web_search_result_location") addToCorpus(corpus, c.url, c.cited_text);
      }
    }
  }
}

function textOf(content: Block[]): string {
  return content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text").map((b) => b.text).join("");
}

export async function researchClaim(claim: string, context?: string): Promise<ResearchResult> {
  const client = anthropic();
  const corpus = emptyCorpus();
  const counters = { searches: 0, fetches: 0 };
  let inputTokens = 0;
  let outputTokens = 0;

  const system: Anthropic.Beta.BetaTextBlockParam[] = [
    { type: "text", text: `${EDITORIAL_RULES}\n\n${RESEARCH_INSTRUCTIONS}`, cache_control: { type: "ephemeral" } },
  ];
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: `<claim>\n${claim}\n</claim>${context ? `\n<editor_context>\n${context}\n</editor_context>` : ""}` },
  ];

  // Stage 1 — open-ended research with server-side web tools. Long turns may
  // pause; resume by sending the paused assistant turn back.
  let memo = "";
  for (let turn = 0; turn < 6; turn++) {
    const stream = client.beta.messages.stream({
      model: env.aiModel,
      max_tokens: 64000,
      ...FALLBACK,
      output_config: { effort: "high" },
      system,
      tools: [
        { type: "web_search_20260209", name: "web_search", max_uses: 12 },
        { type: "web_fetch_20260209", name: "web_fetch", max_uses: 12, citations: { enabled: true } },
      ],
      messages,
    });
    const msg = await stream.finalMessage();
    inputTokens += msg.usage.input_tokens;
    outputTokens += msg.usage.output_tokens;
    collect(msg.content, corpus, counters);
    memo += textOf(msg.content);
    if (msg.stop_reason === "refusal") throw new Error("The research assistant declined this request.");
    if (msg.stop_reason !== "pause_turn") break;
    messages.push({ role: "assistant", content: msg.content });
  }
  if (!memo.trim()) throw new Error("Research produced no memo.");

  const retrievedUrls = [...corpus.seen];

  // Stage 2 — structure the memo into a draft dossier.
  const parsed = await client.beta.messages.parse({
    model: env.aiModel,
    max_tokens: 16000,
    ...FALLBACK,
    output_config: { effort: "medium", format: betaZodOutputFormat(ResearchDraftZ) },
    system: [{ type: "text", text: `${EDITORIAL_RULES}\n\n${STRUCTURE_INSTRUCTIONS}`, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: `<claim>\n${claim}\n</claim>\n<research_memo>\n${memo}\n</research_memo>\n<retrieved_urls>\n${retrievedUrls.join("\n")}\n</retrieved_urls>`,
      },
    ],
  });
  inputTokens += parsed.usage.input_tokens;
  outputTokens += parsed.usage.output_tokens;
  if (parsed.stop_reason === "refusal") throw new Error("The structuring step was declined.");
  const draft = parsed.parsed_output;
  if (!draft) throw new Error("The structuring step returned an unreadable draft.");

  // Grounding: was each URL actually retrieved, and does each quote appear in retrieved text?
  const checks = draft.evidence.map((e) => checkEvidence(corpus, e.url, e.quote));

  return { draft, checks, memo, retrievedUrls, usage: { inputTokens, outputTokens, ...counters } };
}
