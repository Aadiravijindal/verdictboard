// Checks that AI-proposed evidence is grounded in what was actually retrieved.
// Nothing an AI drafts is trusted until these checks pass AND a human approves.

export function normalizeText(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[‐-―]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizeUrl(u: string): string {
  try {
    const url = new URL(u.trim());
    url.hash = "";
    for (const p of [...url.searchParams.keys()]) if (/^utm_|^fbclid$|^gclid$/.test(p)) url.searchParams.delete(p);
    return `${url.host.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}${url.search}`.toLowerCase();
  } catch {
    return u.trim().toLowerCase();
  }
}

/** True if the quote appears (after normalisation) in any of the texts. */
export function quoteAppearsIn(quote: string, texts: string[]): boolean {
  const q = normalizeText(quote);
  if (q.length < 12) return false;
  return texts.some((t) => normalizeText(t).includes(q));
}

export interface RetrievedCorpus {
  /** Normalised URL -> texts retrieved for it (fetched documents and cited passages). */
  byUrl: Map<string, string[]>;
  /** Every URL seen in search results or fetches. */
  seen: Set<string>;
}

export function emptyCorpus(): RetrievedCorpus {
  return { byUrl: new Map(), seen: new Set() };
}

export function addToCorpus(c: RetrievedCorpus, url: string, text?: string) {
  const key = normalizeUrl(url);
  c.seen.add(key);
  if (text) c.byUrl.set(key, [...(c.byUrl.get(key) ?? []), text]);
}

export interface EvidenceCheck {
  urlSeen: boolean;
  quoteVerified: boolean;
}

export function checkEvidence(c: RetrievedCorpus, url: string, quote: string): EvidenceCheck {
  const key = normalizeUrl(url);
  const urlSeen = c.seen.has(key);
  const quoteVerified = !!quote && quoteAppearsIn(quote, c.byUrl.get(key) ?? []);
  return { urlSeen, quoteVerified };
}
