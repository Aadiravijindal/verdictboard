"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Stance = "AGREE" | "DISAGREE" | "UNSURE";

export function VoteWidget({
  claimSlug,
  phase,
  prompts,
  existing,
  signedIn,
  loginHref,
}: {
  claimSlug: string;
  phase: "BEFORE" | "AFTER";
  prompts: { agree: string; disagree: string; unsure: string };
  existing: { stance: Stance; confidence: number } | null;
  signedIn: boolean;
  loginHref: string;
}) {
  const router = useRouter();
  const [stance, setStance] = useState<Stance | null>(existing?.stance ?? null);
  const [confidence, setConfidence] = useState(existing?.confidence ?? 50);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(existing ? "saved" : "idle");
  const [error, setError] = useState("");

  const options: [Stance, string][] = [["AGREE", prompts.agree], ["DISAGREE", prompts.disagree], ["UNSURE", prompts.unsure]];
  const confidenceWord = confidence < 25 ? "Guessing" : confidence < 50 ? "Somewhat unsure" : confidence < 75 ? "Moderate" : confidence < 95 ? "Confident" : "Very confident";

  if (!signedIn) {
    return (
      <p className="text-sm text-muted">
        <a href={loginHref} className="text-accent">Sign in with your email</a> to record an assessment. One vote per verified account; results are shown after you vote.
      </p>
    );
  }

  async function submit() {
    if (!stance) return;
    setStatus("saving");
    const res = await fetch(`/api/claims/${claimSlug}/vote`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phase, stance, confidence }),
    });
    if (res.ok) {
      setStatus("saved");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save your vote.");
      setStatus("error");
    }
  }

  const groupName = `stance-${phase}`;
  return (
    <div>
      <fieldset>
        <legend className="sr-only">Your assessment</legend>
        <div className="grid gap-2">
          {options.map(([value, label]) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-3 border px-4 py-3 transition-colors ${stance === value ? "border-accent bg-accent/10 text-ink" : "border-line hover:border-muted"}`}
            >
              <input type="radio" name={groupName} value={value} checked={stance === value} onChange={() => { setStance(value); setStatus("idle"); }} className="accent-[#B8F36B]" />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="mt-5 block">
        <span className="label">How confident are you?</span>
        <div className="mt-2 flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={confidence}
            onChange={(e) => { setConfidence(Number(e.target.value)); setStatus("idle"); }}
            className="w-full accent-[#B8F36B]"
            aria-valuetext={`${confidence}% — ${confidenceWord}`}
          />
          <span className="h-display w-16 text-right text-3xl">{confidence}%</span>
        </div>
        <span className="label">{confidenceWord}</span>
      </label>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" disabled={!stance || status === "saving" || status === "saved"} onClick={submit}>
          {status === "saving" ? "Saving…" : status === "saved" ? "Recorded" : existing ? "Update my assessment" : "Record assessment"}
        </button>
        {existing && status !== "saved" && <span className="text-xs text-muted">Changes are allowed and recorded in your vote history.</span>}
        {status === "error" && <span className="text-sm text-danger">{error}</span>}
      </div>
    </div>
  );
}
