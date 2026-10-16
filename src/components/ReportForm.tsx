"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const KINDS = [
  ["COUNTEREVIDENCE", "Submit counterevidence"],
  ["CORRECTION", "Propose a correction"],
  ["MISSING_SOURCE", "Suggest a missing source"],
  ["SOURCE_MISREPRESENTED", "A source doesn't say this"],
  ["ABUSE", "Report abuse or manipulation"],
  ["OTHER", "Something else"],
] as const;

export function ReportForm({ claimId, sourceId, signedIn }: { claimId?: string; sourceId?: string; signedIn: boolean }) {
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!signedIn) {
    return (
      <p className="text-sm text-muted">
        <a href={`/login?next=${encodeURIComponent(pathname)}`}>Sign in</a> to challenge evidence or propose a correction. Challenges are reviewed against our <a href="/methodology#challenges">published rules</a>, whichever party or government the claim concerns.
      </p>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: form.get("kind"), body: form.get("body"), url: form.get("url") || undefined, claimId, sourceId }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setState("sent");
      setMessage("Thank you. Your submission is in the review queue; outcomes of accepted corrections appear in the public corrections log.");
    } else {
      setState("error");
      setMessage(data.error ?? "Something went wrong.");
    }
  }

  if (state === "sent") return <p className="border border-agreed p-4 text-sm text-agreed">{message}</p>;

  return (
    <form onSubmit={submit} className="grid gap-3">
      <label className="block">
        <span className="label">Type</span>
        <select name="kind" className="input mt-1" required defaultValue="COUNTEREVIDENCE">
          {KINDS.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="label">Details (cite page, paragraph or timestamp where possible)</span>
        <textarea name="body" className="input mt-1 min-h-28" required minLength={20} maxLength={5000} />
      </label>
      <label className="block">
        <span className="label">Link to evidence (optional)</span>
        <input name="url" type="url" className="input mt-1" placeholder="https://" maxLength={2000} />
      </label>
      {state === "error" && <p className="text-sm text-danger">{message}</p>}
      <div>
        <button className="btn-primary" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Submit for review"}</button>
      </div>
    </form>
  );
}
