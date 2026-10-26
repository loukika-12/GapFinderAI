# GapFinder AI

A welcoming study companion that helps learners organize course materials, discover knowledge gaps, practise with short diagnostics, and turn results into a clear revision plan.

## Features
- Responsive dashboard with overview, materials, topic map, diagnostic quiz, revision plan, and study assistant.
- Supabase email/password authentication plus a one-click demo workspace that does not require an account.
- Per-user persistent workspace and study activity, protected by Row Level Security (RLS).
- Text/Markdown notes and PDF file listing, with material-name search and Markdown note export. **PDF text extraction is not implemented**; paste notes or use TXT/Markdown for note analysis.
- Accessible forms, mobile navigation, helpful feedback, and clear labels.

## Stack
Next.js App Router, React, TypeScript, Lucide, CSS, Supabase Auth/Postgres.

## Run locally
Use Node.js 20.9+.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Never put Supabase service-role keys in browser variables or commit secrets.

## Supabase setup
The connected project has the `materials`, `study_activity`, and `study_workspaces` tables with RLS enabled. The SQL migration in `supabase/migrations` documents the workspace/activity schema and access rules. Apply equivalent migrations when using a different Supabase project.

Enable Email auth in Supabase Authentication. Set the Site URL and allowed redirect URLs to your local URL and the deployed Render URL. Email confirmation can remain enabled for real accounts. The demo workspace is local-browser-only and does not use Supabase authentication or cloud persistence.

## Render
This repository includes `render.yaml`. Connect `loukika-12/GapFinderAI` in Render and create a **Node Web Service** from the `main` branch. Build command: `npm install && npm run build`; start command: `npm run start`. Add the two environment variables above in Render's Environment settings. Render will deploy automatically on subsequent pushes if auto-deploy is enabled.

## Data and privacy
Workspace rows and activity are scoped to the authenticated Supabase user. RLS policies enforce this in the database. Do not upload sensitive documents. Only the user's notes and workspace JSON are stored; uploaded binary files are not uploaded to Supabase Storage. Built-in diagnostic questions and sample topic estimates are illustrative unless replaced with course-specific questions.
