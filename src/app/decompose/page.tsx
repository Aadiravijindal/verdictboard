import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { Decomposer } from "@/components/Decomposer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Check a claim", description: "Break a viral political claim into precise, testable questions and find existing dossiers." };

export default async function DecomposePage({ searchParams }: { searchParams: Promise<{ text?: string }> }) {
  const [user, sp] = await Promise.all([getCurrentUser(), searchParams]);
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="label text-accent">Claim checker</p>
      <h1 className="h-display mt-2 text-6xl sm:text-7xl">What exactly is being claimed?</h1>
      <p className="mt-4 max-w-prose text-muted">
        Paste a post, headline or quote. We break it into the precise questions that would have to be answered, the evidence that would answer them, and the loaded or vague terms to pin down — then point you to dossiers we have already published.
      </p>
      <p className="mt-2 max-w-prose text-sm text-muted">
        This tool does not tell you whether the claim is true. It uses an AI model to structure the question; only human-reviewed dossiers carry evidence assessments. <a href="/ai-policy">How we use AI</a>.
      </p>
      <div className="mt-8">
        <Decomposer signedIn={!!user} aiEnabled={env.aiEnabled} initialText={sp.text ?? ""} />
      </div>
    </div>
  );
}
