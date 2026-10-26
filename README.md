# GapFinder AI
### Diagnose learning gaps. Prioritize revision. Learn with direction.

**Live app:** [gapfinder-ai-xncp.onrender.com](https://gapfinder-ai-xncp.onrender.com) · **Repository:** [loukika-12/GapFinderAI](https://github.com/loukika-12/GapFinderAI)

GapFinder AI is a study workspace designed around a diagnosis-first learning workflow: organize study materials, assess understanding, identify weak topics, and plan revision.

> **Evaluator quick start:** Open the live app → choose **Continue with demo workspace / Login directly as demo** → explore the sample dashboard, topic estimates, diagnostic quiz, and revision checklist. Demo data is browser-local and does not require account authorization. The displayed demo credentials are illustrative UI credentials; the one-click demo entry is the actual no-auth demo route.

---

## Evaluator navigation

| Deliverable | Open |
|---|---|
| 🚀 **Hosted application** | [Launch GapFinder AI](https://gapfinder-ai-xncp.onrender.com) |
| 📘 **Complete project documentation** | [Project report](docs/PROJECT_DOCUMENTATION.md) |
| 🧭 **Architecture overview** | [Architecture and system design](docs/ARCHITECTURE.md) |
| 🧠 **RAG pipeline and AI workflow** | [RAG and AI workflow](docs/RAG_AND_AI_WORKFLOW.md) |
| 🧪 **Sample syllabus and study material** | [Sample syllabus](sample-materials/sample-syllabus.md) · [Sample notes](sample-materials/sample-notes.md) |
| 🛠️ **Setup and deployment** | [Local setup](#local-setup) · [Render deployment](#render-deployment) |
| ⚠️ **Limitations and roadmap** | [Known limitations](docs/PROJECT_DOCUMENTATION.md#22-known-limitations) · [Future roadmap](docs/PROJECT_DOCUMENTATION.md#23-future-roadmap) |
| 🔐 **Security and privacy** | [Security and privacy](docs/PROJECT_DOCUMENTATION.md#15-security-privacy-and-demo-access) |

## Project deliverables checklist

- [x] GitHub repository with source code and setup instructions.
- [x] README navigation for evaluators.
- [x] Complete project documentation: problem statement, objectives, scope, requirements, limitations, future enhancements.
- [x] Architecture overview and proposed full-system architecture.
- [x] RAG pipeline description: ingestion, chunking, embeddings, retrieval, generation, citations, and quality checks.
- [x] AI workflow: question generation, answer evaluation, gap analysis, and revision planning.
- [x] Hosted Render application.
- [x] No-auth demo workspace for immediate evaluator access.
- [x] Sample syllabus and notes committed in the repository for review and manual testing.
- [ ] Full production RAG implementation with pgvector, material-grounded questions, and verifiable citations.
- [ ] PDF text extraction and persistent uploaded-file storage.
- [ ] Validated topic mastery analytics and adaptive plan recalculation.

The checked items describe repository/documentation or current prototype deliverables. Unchecked items are intentionally marked as remaining work, not represented as completed features.

## Project at a glance

### Problem statement
Students often revise familiar topics repeatedly while hidden knowledge gaps remain undiscovered. A generic chatbot waits for a question; GapFinder AI is designed to diagnose weak areas first and recommend what to revise next.

### Core workflow
1. Organize a syllabus, notes, and past questions.
2. Map content to topics.
3. Assess understanding with diagnostic questions.
4. Explain topic ratings using evidence.
5. Prioritize a personalized revision plan.
6. Reassess and update recommendations as the student improves.

### Current features
- Responsive dashboard, topic map, diagnostic quiz, revision checklist, and study assistant interface.
- Supabase email/password authentication and per-user workspace/activity storage with RLS.
- Local demo workspace that requires no account.
- TXT/Markdown notes, material search, and Markdown note export.
- Dark theme with high-contrast controls.

**Current prototype limitation:** PDF text extraction and full document-grounded RAG are not implemented. Built-in quiz questions and topic estimates are illustrative. See the full documentation before evaluating the AI claims.

## Technology stack

- Next.js App Router, React, TypeScript
- CSS and Lucide icons
- Supabase Auth and PostgreSQL with row-level security
- Render hosting and GitHub Actions validation

## Local setup

**Prerequisites:** Node.js 20.9+ and npm.

```bash
git clone https://github.com/loukika-12/GapFinderAI.git
cd GapFinderAI
npm install
```

Create `.env.local` from `.env.example` (or create it manually) and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Then run:

```bash
npm run dev
```

Open the local URL printed by Next.js, normally `http://localhost:3000`.

For validation and production build:

```bash
npm run lint
npm run build
npm run start
```

Never commit `.env.local`, service-role keys, or private AI-provider keys.

## Supabase setup

1. Configure the project URL and publishable key.
2. Apply the migrations under `supabase/migrations`.
3. Enable the email/password provider if using registered accounts.
4. Add the local URL and deployed Render URL to the allowed redirect URLs.
5. Verify RLS is enabled and test that separate users cannot access each other's data.

The demo workspace is local-browser-only and does not use Supabase authentication or cloud persistence.

## Render deployment

The repository includes `render.yaml`. The configured service uses:
- Build: `npm install && npm run build`
- Start: `npm run start`
- Branch: `main`
- Environment variables: the two Supabase values above.

Open the [Render dashboard](https://dashboard.render.com/web/srv-dbfm7t8m7kps739kjfm0) to inspect deployment status. A pushed commit is not considered live until Render reports a successful deployment.

## Repository structure

```text
.
├── app/                       # Next.js App Router entry points
├── src/
│   ├── App.tsx                # Main study workspace and flows
│   ├── styles.css             # UI styling and dark theme
│   └── lib/                   # Shared helpers / Supabase integration
├── docs/
│   ├── PROJECT_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   └── RAG_AND_AI_WORKFLOW.md
├── sample-materials/
│   ├── sample-syllabus.md
│   └── sample-notes.md
├── supabase/migrations/       # Database schema and RLS migrations
├── .env.example               # Environment variable template
├── render.yaml                # Render service configuration
└── README.md                  # Evaluator entry point
```

## Data, privacy, and responsible use

Authenticated workspace rows and activity should be scoped to the current user by RLS. Demo progress is stored in browser-local storage and may disappear if browser data is cleared. Binary files are not currently uploaded to Supabase Storage. Do not upload sensitive documents to a public judging demo.

## Evaluation note

The application is a working prototype, not yet the complete AI system described in the target architecture. The documentation explicitly separates current features from proposed work. Full RAG should only be considered complete after source-grounded question generation, citation verification, retrieval evaluation, and cross-user isolation tests pass.
