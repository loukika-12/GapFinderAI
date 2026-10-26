# GapFinder AI — Architecture Overview

[Back to repository README](../README.md) · [Full project documentation](PROJECT_DOCUMENTATION.md) · [RAG and AI workflow](RAG_AND_AI_WORKFLOW.md)

## Product architecture

### Current prototype

```text
┌─────────────────────────────────────────────┐
│ Browser: Next.js / React / TypeScript       │
│ Dashboard · Materials · Topic Map          │
│ Diagnostic Quiz · Revision Plan · Assistant│
│ Local demo workspace                        │
└───────────────────────┬─────────────────────┘
                        │ HTTPS
            ┌───────────┴─────────────┐
            │                         │
┌───────────▼───────────┐  ┌──────────▼──────────┐
│ Next.js API route     │  │ Supabase            │
│ Study assistant       │  │ Auth + PostgreSQL   │
└───────────────────────┘  │ materials           │
                           │ study_workspaces    │
                           │ study_activity      │
                           │ RLS                 │
                           └─────────────────────┘
```

The demo path intentionally bypasses account authorization and uses browser-local storage. It must not be treated as a shared account or granted access to authenticated users' private data.

### Target architecture for the complete AI product

```text
Documents → Extract → Clean → Chunk + provenance
                              │
                              ▼
                       Embedding model
                              │
                              ▼
                    Supabase PostgreSQL
                         + pgvector
                              │
                 User-scoped retrieval
                              │
              ┌───────────────┴─────────────┐
              ▼                             ▼
      Topic map & source links       Context chunks + citations
              │                             │
              └──────────────┬──────────────┘
                             ▼
                    Grounded question generation
                             │
                             ▼
                    Student answers + evaluation
                             │
                             ▼
                    Topic gap analysis
                             │
                             ▼
                    Adaptive revision plan
                             │
                             ▼
                  Progress dashboard + citations
```

## Component responsibilities

- **Frontend:** material management, quizzes, topic map, gap report, plan, assistant, and progress UI.
- **Next.js server routes:** validate input, enforce user ownership, invoke retrieval/model providers, and return structured responses.
- **Supabase Auth:** identity for registered users.
- **PostgreSQL + RLS:** per-user records and policy enforcement.
- **pgvector (planned):** semantic retrieval over chunk embeddings.
- **LLM provider (planned/only when configured in implementation):** generation and rubric-based evaluation based on retrieved evidence.
- **Render:** hosts the Node web service; GitHub main-branch pushes trigger deployment.

## Security boundaries

1. The browser must never receive a service-role key or private AI-provider key.
2. All user-owned records require RLS and server-side ownership checks.
3. Retrieval must filter by the authenticated user before returning chunks.
4. Retrieved text is untrusted content and cannot override system instructions.
5. Citations must reference actual source metadata, not model-invented page numbers.
6. Demo data remains local-only and is never used to bypass RLS for real accounts.

## Architecture status

The current UI, authentication/workspace storage, and study flows form the prototype foundation. Full document extraction, vector indexing, citation-grounded question generation, and validated gap analysis are future implementation milestones. See [Known limitations](PROJECT_DOCUMENTATION.md#22-known-limitations).
