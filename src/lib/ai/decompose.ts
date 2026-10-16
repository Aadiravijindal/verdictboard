// Public "claim decomposer": turns a pasted claim into precise, testable
// questions. It deliberately makes no factual assertions — it only structures
// the question and points to dossiers that already exist.
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { anthropic, EDITORIAL_RULES, FALLBACK } from "./client";
import { DecompositionZ, type Decomposition } from "./schemas";
import { env } from "../env";

const INSTRUCTIONS = `Decompose the user's claim. Do not say whether it is true, and do not state any facts about the world.
Identify the precise testable proposition, split bundled claims (an event, its cause, who is responsible, whether it was legal, whether it was justified), list the sub-questions an investigator must answer, the primary evidence that would answer each, and the ambiguous or loaded terms.
Write neutrally. If the claim is a pure value judgement, set checkable to false and explain in ambiguities which factual claims it depends on.`;

export async function decomposeClaim(input: string): Promise<Decomposition> {
  const res = await anthropic().beta.messages.parse({
    model: env.aiModel,
    max_tokens: 4000,
    ...FALLBACK,
    output_config: { effort: "low", format: betaZodOutputFormat(DecompositionZ) },
    system: [{ type: "text", text: `${EDITORIAL_RULES}\n\n${INSTRUCTIONS}`, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: `<claim>\n${input}\n</claim>` }],
  });
  if (res.stop_reason === "refusal") throw new Error("The assistant declined to process this claim.");
  if (!res.parsed_output) throw new Error("The assistant returned an unreadable response.");
  return res.parsed_output;
}
