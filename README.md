# Workify — Demo Build

AI-powered recruiter outreach SaaS. Single-cyan-accent Bloomberg-intel UI built per the v1.0 design handoff.

**Demo cut:** All 9 screens fully designed. The **Scrape → Dossier** flow is fully wired with real LinkdAPI + real Claude AI. Other screens use seeded mock data so Mike can click around without anything looking broken.

---

## What's inside

| Screen | Status |
|---|---|
| Gate (password splash) | ✅ Real password auth |
| Dashboard | ✅ Designed, mock KPIs |
| Leads (Kanban) | ✅ Drag-drop, 15 seed prospects |
| **Recruiter Dossier** | ⭐ **Real LinkdAPI + real Claude AI** |
| **Scrape** | ⭐ Real LinkdAPI search |
| Bulk Import | ✅ Designed, animated mock |
| Sequences | ✅ Designed, seeded data |
| Calendar | ✅ Designed, auto-schedule animation |
| Calls | ✅ Designed, transcript drawer |
| Settings | ✅ Designed, static |

---

## Deploy in 15 minutes

### 1 · Push to GitHub (3 min)

```bash
cd workify-demo
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Devupa2005/workify-demo.git
git push -u origin main
```

If the repo already has commits, force-push the first time:
```bash
git push -u origin main --force
```

### 2 · Create Supabase schema (2 min)

1. Open https://supabase.com/dashboard/project/nbikzagsfpkiursgylqa
2. Click **SQL Editor** in the left nav
3. Paste the contents of `supabase/schema.sql`
4. Click **Run**

(The demo uses seed data from `src/mocks/seed-data.ts`, so this is optional but documents the production schema.)

### 3 · Deploy to Vercel (5 min)

1. Go to https://vercel.com/new
2. Click **Import Git Repository** → choose `Devupa2005/workify-demo`
3. **Framework Preset:** Next.js (auto-detected)
4. Before clicking Deploy, expand **Environment Variables** and add **all six** of these:

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your rotated Anthropic key (sk-ant-...) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nbikzagsfpkiursgylqa.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your rotated Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your rotated Supabase service role key |
| `LINKDAPI_KEY` | Your rotated LinkdAPI key |
| `WORKIFY_GATE_PASSWORD` | `Workify2278$$` |

5. Click **Deploy**. Build takes ~90 seconds.
6. Vercel gives you a URL like `workify-demo-abc123.vercel.app`. Send Mike that link + the password.

### 4 · Test locally (optional, 2 min)

```bash
cp .env.local.example .env.local
# Fill in real values in .env.local
npm install
npm run dev
# Open http://localhost:3000
```

---

## Demo walkthrough for Mike

Send Mike this link and password, then walk him through:

1. **Gate** → enters `Workify2278$$` → lands on Dashboard
2. **Dashboard** → "11 prospects active · $357K pipeline" — looks alive
3. **Leads** → drag a card between columns to advance pipeline stage
4. **Scrape** → type *Sarah Reyes* in the query box → click **Run scrape** → watch results stream in
5. **Click into Sarah Reyes** → lands on her Dossier
6. **Click the "Why & How" tab** (has a violet AI badge)
7. **Click "Generate everything"** — real Claude AI generates:
   - 3 inferred pain points specific to Sarah at Lattice Forge
   - A personalized cold email pitching Paraform's 21-day fill rate
   - A 1-page prep brief for the discovery call
8. **Click "Send + schedule"** — confirmation appears: "Email sent · Day-3 follow-up auto-scheduled"

That's the magic moment.

---

## Architecture

```
Next.js 14 (App Router) + TypeScript
  ├── src/app/page.tsx              Gate (password splash)
  ├── src/app/(app)/                Authenticated routes (middleware-protected)
  ├── src/app/api/                  Server functions
  │     ├── search-prospect/        → LinkdAPI
  │     ├── generate-email/         → Anthropic Claude
  │     ├── infer-pain/             → Anthropic Claude
  │     └── prep-brief/             → Anthropic Claude
  └── src/lib/                      Supabase + LinkdAPI + Anthropic wrappers
```

**Design system:** Tailwind + CSS variables. Tokens in `tailwind.config.ts` and `src/app/globals.css`. The `no shadows ever` rule is enforced globally; opt back in with class `.allow-shadow`.

**AI:** Claude Sonnet 4.5 via `@anthropic-ai/sdk`. All prompts in `src/lib/anthropic.ts` are tuned to pitch Paraform's 21-day fill rate.

**Data:** LinkdAPI for real LinkedIn profile data. Free tier = 100 lookups. Plenty for the demo.

---

## Notes for production (post-Mike)

- Replace seed data with real Supabase queries
- Enable RLS policies on all tables (schema has them disabled for demo)
- Add Gmail OAuth for actually sending emails (the "Send" button currently fakes it)
- Add Stripe for billing
- Move from single-password gate to Clerk auth

---

© Lvexio · Workify · v1.0.0 · 2026
