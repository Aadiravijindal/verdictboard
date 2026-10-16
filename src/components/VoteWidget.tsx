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
  dark = false,
  compact = false,
}: {
  claimSlug: string;
  phase: "BEFORE" | "AFTER";
  prompts: { agree: string; disagree: string; unsure: string };
  existing: { stance: Stance; confidence: number } | null;
  signedIn: boolean;
  loginHref: string;
  dark?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [stance, setStance] = useState<Stance | null>(existing?.stance ?? null);
  const [confidence, setConfidence] = useState(existing?.confidence ?? 50);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(existing ? "saved" : "idle");
  const [error, setError] = useState("");

  const options: [Stance, string, string][] = [
    ["AGREE", "Agree", prompts.agree],
    ["DISAGREE", "Disagree", prompts.disagree],
    ["UNSURE", "Unsure", prompts.unsure],
  ];
  const confidenceWord = confidence < 25 ? "Guessing" : confidence < 50 ? "Somewhat unsure" : confidence < 75 ? "Moderately confident" : confidence < 95 ? "Confident" : "Very confident";

  if (!signedIn) {
    return (
      <div className={`flex flex-wrap items-center gap-4 rounded-2xl p-5 ${dark ? "bg-white/[0.07]" : "bg-white"}`}>
        <p className={`flex-1 text-[15px] ${dark ? "text-white/75" : "text-ink/75"}`}>Log in with your email to vote. One vote per verified account.</p>
        <a href={loginHref} className={`${dark ? "btn-light" : "btn-primary"} no-underline`}>Log in to vote</a>
      </div>
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

  const tile = (selected: boolean) =>
    dark
      ? selected ? "bg-white text-ink" : "bg-white/[0.07] text-white hover:bg-white/[0.12]"
      : selected ? "bg-ink text-white" : "bg-white text-ink hover:bg-white/70 ring-1 ring-line";

  return (
    <div>
      <fieldset>
        <legend className="sr-only">Your assessment</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {options.map(([value, short, long]) => (
            <label key={value} className={`flex cursor-pointer flex-col rounded-2xl p-4 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${tile(stance === value)}`}>
              <input type="radio" name={`stance-${phase}`} value={value} checked={stance === value} onChange={() => { setStance(value); setStatus("idle"); }} className="sr-only" />
              <span className="font-display text-lg font-bold">{short}</span>
              {!compact && <span className={`mt-1 text-[13px] ${stance === value ? "opacity-70" : "opacity-60"}`}>{long.replace(/^(Agree|Disagree|Unsure) — /, "")}</span>}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="mt-6 block">
        <span className="flex items-baseline justify-between">
          <span className={`text-sm font-semibold ${dark ? "text-white/80" : ""}`}>How confident are you?</span>
          <span className="font-display text-2xl font-bold">{confidence}%</span>
        </span>
        <input
          type="range" min={0} max={100} step={5} value={confidence}
          onChange={(e) => { setConfidence(Number(e.target.value)); setStatus("idle"); }}
          className="mt-3 w-full accent-[#0666EB]"
          aria-valuetext={`${confidence}% — ${confidenceWord}`}
        />
        <span className={`text-[13px] ${dark ? "text-white/50" : "text-muted"}`}>{confidenceWord}</span>
      </label>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" className={dark ? "btn-light" : "btn-primary"} disabled={!stance || status === "saving" || status === "saved"} onClick={submit}>
          {status === "saving" ? "Saving…" : status === "saved" ? "✓ Recorded" : existing ? "Update my assessment" : "Record assessment"}
        </button>
        {existing && status !== "saved" && <span className={`text-[13px] ${dark ? "text-white/50" : "text-muted"}`}>You can change your vote; changes are kept in your history.</span>}
        {status === "error" && <span className="text-sm text-danger">{error}</span>}
      </div>
    </div>
  );
}
