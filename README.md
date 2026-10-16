# VerdictBoard

**Don't take the claim. Trace the evidence.**

VerdictBoard lets people investigate political claims against primary evidence. Every claim gets a dossier that separates three layers, which the code also keeps apart:

| Layer | What it holds | Where it lives |
| --- | --- | --- |
| **A. What the evidence establishes** | Records, rulings, data, corroborated facts — with provenance | `Claim.status/reason`, `Source`, `EvidenceLink`, `Event` |
| **B. What the facts mean** | Competing interpretations with their reasoning | `Perspective` |
| **C. What people believe** | Votes and confidence from participating users | `Vote` — never read when setting a label |

## What ships

- **10 launch topics, 37 claim dossiers, 78 sources, 74 timeline events**: Israel–Palestine, India election integrity, Russia–Ukraine, the 2020 US election, climate change, COVID-19 origins, Indian policy and accountability (demonetisation, Article 370, CAA, Adani–Hindenburg), economics (tariffs, inflation, minimum wage, Brexit), Xinjiang, and immigration and crime. Content was last reviewed on 16 Oct 2026.
- **Claim dossiers**: the exact proposition, a label with its reason (*Widely agreed / Disputed / Unverified*), scope, sub-questions, what's established, what's contested, counterevidence, missing evidence, viral versions of the claim, evidence grouped by relation with provenance and limitations, a **source graph** that groups repeated reporting by origin, a corrections history, a challenge form and a JSON download.
- **Timeline explorer**: you can choose where to start reading. Earlier events stay counted and one click away, and key context is flagged.
- **Voting built for honest measurement**: separate prompts for each question type; first-impression and after-reading votes feeding an **evidence-impact meter**; results hidden until you vote; one vote per account, claim and phase (enforced by the database); changes recorded; 95% intervals; established accounts shown separately; subgroups suppressed below a minimum size; self-reported demographics only.
- **AI where it saves work, humans where it matters**
  - *Claim checker* (public): breaks a pasted claim into testable questions and links existing dossiers. It never judges whether the claim is true.
  - *Research desk* (editors): Claude searches and opens primary sources, extracts quotes, flags repeated reporting and drafts a dossier.
  - *Grounding checks*: each AI-cited URL must have been retrieved during research, and each quote must appear in the retrieved text. Quotes that don't match block publication.
  - *Publication gate*: every evidence link needs individual approval, and a **second editor** must publish.
- **Editorial workflow**: Draft → In review → Published → Archived; challenge queue with published decision rules; roles (reviewer, editor, admin); an append-only audit log; a public **corrections log** that records every change to a published label, reason, proposition or scope automatically.
- **Trust pages**: methodology (the eight rules), AI policy, funding and governance, open-data API (CC BY 4.0).
- **Security**: passwordless email sign-in (single-use tokens confirmed by POST, so link scanners can't use them up); httpOnly sessions; Postgres-backed rate limits keyed on hashed IPs; same-origin checks on every write; a CSP and security headers; server-side authorisation on every editorial action; vote data never exposed by the API.

## Run locally

```bash
cp .env.example .env              # set DATABASE_URL, APP_SECRET, ADMIN_EMAILS
npm install
npx prisma migrate deploy
npm run db:seed                   # loads /content
npm run dev                       # http://localhost:3000
```

Without `RESEND_API_KEY`, sign-in links are printed to the server console in development. Sign in with an address listed in `ADMIN_EMAILS` to get the editorial desk at `/admin`.

Or run everything with Docker: `docker compose up --build`.

## Deploy (Vercel + managed Postgres)

1. Create a Postgres database (Neon, Supabase or RDS) and copy its connection string.
2. Import the repo into Vercel. Set `DATABASE_URL`, `APP_URL`, `APP_SECRET` (32+ chars), `ADMIN_EMAILS`, `RESEND_API_KEY` and `EMAIL_FROM` (on a domain you've verified with Resend). Add `ANTHROPIC_API_KEY` to turn on the AI features.
3. The `vercel-build` script runs migrations. After the first deploy, run `npm run db:seed` once against the production database.
4. Check `/api/health`.

The research desk runs jobs after the response with `after()`. If your host cuts off background work, run `npm run research:worker` from a cron job.

## Before you announce launch — owner checklist

These depend on decisions or access only you have:

- [ ] **Run `npm run check:sources` from an unrestricted network.** The build environment blocked outbound requests, so the source URLs were written with care and many were cross-checked by search, but they haven't all been fetched automatically. Fix any 404s it reports.
- [ ] **Have a human editor review every dossier**, especially the Israel–Palestine, Xinjiang and India topics, and claims about named people (the Adani and Mahadevapura dossiers). Get legal review for defamation and privacy risk in your jurisdictions.
- [ ] Fill in `ORG_NAME` and `FUNDING_DISCLOSURE`, and correct the default funding and governance wording on `/about` if it doesn't match your actual policy.
- [ ] Appoint at least two editors, so the second-reviewer rule can work.
- [ ] Confirm the brand name and check trademark availability.
- [ ] Set a review cadence: live topics (Gaza casualty figures, pending court cases) go out of date quickly.

## Editing content

Launch content is reviewed like code, in `content/topics/*.ts`. `npm run check:content` validates it: label and reason must be compatible, sources must exist, disputed claims must carry counterevidence, and so on. Re-seeding updates the database and writes a **public correction** for every material change to a published claim. Day-to-day work (AI-assisted drafts, challenges, corrections) happens in `/admin`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run check:content` | Validate editorial content |
| `npm test` | Unit tests (vote statistics, gating rules, grounding checks, source graph, content rules) |
| `npm run check:sources` | Check every source URL; results go to the admin link-health page |
| `npm run research:worker` | Process queued or stuck AI research jobs |
| `npm run deploy:db` | Run migrations and seed |

Stack: Next.js 15 (App Router) · TypeScript · Tailwind · Prisma · PostgreSQL · Anthropic Claude (`claude-opus-5-5` by default; override with `ANTHROPIC_MODEL`).
