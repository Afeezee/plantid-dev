# PlantiD — Next.js migration scaffold

This is a working scaffold for migrating PlantiD off Base44 onto a stack you
control: **Next.js (App Router)**, **Clerk** (auth), **Neon Postgres +
Drizzle** (database), and the **Anthropic API** (vision + chat), in place of
Base44's `auth.me()`, entities, and `InvokeLLM`/`UploadFile` integrations.

## What's here vs. what's stubbed

**Fully wired:**
- Clerk auth + middleware protecting the app shell and admin route
- Drizzle schema for the three Base44 entities (`Analysis`, `Conversation`, `ContactMessage`) + a `rate_limit_events` table for per-user quotas
- `/api/analyze` — the Upload & Analyze flow (create pending record → call Anthropic vision → update record), using forced tool-use to get a structured result the same way `InvokeLLM`'s JSON-schema mode did
- `/api/chat` — streaming assistant replies, persisted to the `Conversation` row
- `/api/history` (GET / DELETE / PATCH for feedback), `/api/contact`, `/api/admin/stats`, `/api/upload`
- Per-user sliding-window rate limits on `/api/analyze` and `/api/chat` (Postgres-backed; tunable in `lib/rate-limit.ts`)
- Pages: Landing, Upload, History (with detail modal), Assistant, Admin Dashboard, Drone Mode, Feedback, Settings, About, FAQs, Contact
- PDF export of any completed analysis (Upload result view and History detail modal) — powered by the already-in-`package.json` `jspdf` + `html2canvas`
- Role-based admin gate via Clerk `publicMetadata.role`
- Base44 data importer scaffold at `scripts/import-base44.ts` — reads analyses/conversations/contact_messages JSON exports; run with `--dry-run` first

**Stubbed / not yet built** — flag these before going live:
- The importer's field mapping is written to the entity shapes documented in `PlantiD.docx`; verify against an actual Base44 export before doing a full import
- Word-format export (only PDF is implemented; add via `docx` if needed)
- Rate limits currently live in Postgres — swap to Upstash Redis if traffic warrants it

## Local dev without a Vercel Blob token

`/api/upload` falls back to writing photos into `public/uploads/` when
`BLOB_READ_WRITE_TOKEN` is empty, so the full Upload → Analyse flow works
locally before you've provisioned Blob storage. Production **must** have
the token — otherwise photos land on the server's disk (ephemeral on
Vercel) instead of Blob.

## Design tokens

A "field-journal / herbarium ledger" direction, chosen to avoid the generic
cream-and-terracotta AI-app look:

| Token | Hex | Use |
|---|---|---|
| `ink-950` | `#0D1712` | App background (near-black botanical) |
| `parchment-100` | `#EDE6D6` | Primary text |
| `moss-500` | `#6B9B57` | Active nav / healthy state |
| `ochre-500` | `#D4A24C` | Primary accent — "specimen label" stamp |
| `rust-500` | `#B5533C` | Disease severity / compliance alerts |

The dark palette above is the default; a full parchment-paper **light**
palette lives in `app/globals.css` under `:root.light`. Tokens are mapped
to CSS variables in `tailwind.config.ts`, so `text-parchment-100`,
`bg-ink-950`, etc. all flip when the user toggles theme. The switch is a
lucide sun/moon in the sidebar / marketing header, and a no-flash script
in `<head>` (`components/ThemeScript.tsx`) reads localStorage +
`prefers-color-scheme` before hydration.

Signature element: the `.specimen-label` card (see `app/globals.css`) styles
identification/health/compliance results like a herbarium specimen tag,
carried through Landing, Upload, and History. The wordmark uses the
`PlantidLogo` (`components/PlantidLogo.tsx`); the favicon and apple-touch
icon are generated at build time by `app/icon.tsx` and `app/apple-icon.tsx`.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Clerk, Neon, Anthropic, Blob keys
npm run db:generate
npm run db:migrate
npm run dev
```

To make a user an admin, set `publicMetadata: { role: "admin" }` on their
Clerk user (Clerk Dashboard → Users → Edit metadata).

## Entity → table mapping

| Base44 entity | Postgres table | Notes |
|---|---|---|
| `Analysis` | `analyses` | `result` jsonb keeps the full LLM response for audit |
| `Conversation` | `conversations` | `messages` stored as jsonb array, same shape as before |
| `ContactMessage` | `contact_messages` | Public insert, admin-only read via `/api/admin/stats` |
| `User` + RLS role check | Clerk user + `publicMetadata.role` | Checked in `lib/auth.ts`, not in the DB |
| (new) rate-limit log | `rate_limit_events` | One row per LLM-costing call; drives the sliding-window check in `lib/rate-limit.ts` |
