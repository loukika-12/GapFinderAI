# GapFinder AI — Complete Project Documentation

**Project type:** AI-assisted personalized learning and knowledge-gap diagnosis  
**Repository:** https://github.com/loukika-12/GapFinderAI  
**Hosted application:** https://gapfinder-ai-xncp.onrender.com

> This document distinguishes the current prototype from planned capabilities. Full RAG, PDF text extraction, dynamically generated material-grounded questions, and validated mastery analytics are goals, not completed features in the current repository.

## 1. Project overview

GapFinder AI is a study workspace designed to help learners discover what they do not yet understand, rather than simply asking a chatbot for answers. Students often spend equal time on every chapter, even when some topics are familiar and others remain weak. The application aims to organize course material, assess topic-level understanding, explain the results, and turn the diagnosis into an actionable revision plan.

The central product principle is **diagnosis before advice**. Chat can support learning, but the main output should be a reasoned gap report and a revision plan that changes as evidence of learning changes.

## 2. Problem statement

Students may spend considerable time revising material they already know while leaving gaps undiscovered. Traditional search and chat tools usually respond to explicit questions; they cannot reliably identify a learner's unknown unknowns without structured assessment. Generic chat-with-document tools may summarize content, but do not necessarily measure understanding or prioritize what should be studied next.

GapFinder AI connects learning resources, diagnostic evidence, topic-level analysis, and a personalized plan in one workflow.

## 3. Purpose and objectives

### Main objective
Build a material-aware learning application that identifies topic-level knowledge gaps and turns the diagnosis into a prioritized, measurable revision plan.

### Specific objectives
1. Collect syllabus information, notes, textbook extracts, and past question papers in one workspace.
2. Represent a course as a structured topic map.
3. Assess understanding through diagnostic questions.
4. Explain why a topic is rated strong, medium, or needing focus.
5. Prioritize tasks according to weakness, importance, deadlines, and available study time.
6. Track progress across attempts and update recommendations.
7. Provide explanations grounded in the learner's material.
8. Protect personal workspaces through authentication and row-level security.
9. Offer a demo route so evaluators can explore without creating an account.
10. Make AI behavior auditable through source references, explanations, and transparent limitations.

## 4. Target users and use cases

- **School and college students:** prepare for examinations and identify weak chapters.
- **Competitive-exam aspirants:** prioritize high-value topics and practice from their resources.
- **Self-learning individuals:** organize material and create a consistent revision routine.
- **Teachers:** identify common topic-level misconceptions and plan targeted support (future capability).
- **Parents or mentors:** review progress with a learner's consent (future capability).

## 5. Scope and feature status

### Current prototype capabilities
- Responsive study workspace and overview dashboard.
- Material name and notes fields.
- TXT and Markdown file reading in the browser.
- PDF filename/listing support; PDF text extraction is not implemented.
- Material list search and Markdown export of current notes.
- Built-in diagnostic quiz and topic estimates.
- Revision-plan checklist with completion tracking.
- Study-assistant interface and server API route.
- Local-browser demo mode that bypasses sign-in and stores demo progress in browser storage.
- Supabase email/password authentication and per-user workspace/activity persistence.
- Dark UI, mobile navigation, feedback messages, and keyboard focus styling.

### Important capabilities still to implement
- Reliable PDF, syllabus, textbook, and past-paper parsing.
- Text chunking, embeddings, and vector retrieval.
- RAG-grounded question generation with real source citations.
- Evidence-based answer evaluation and explanations.
- Topic confidence calculations based on sufficient assessment evidence.
- Revision planning based on weakness, exam date, available time, and topic importance.
- Persistent quiz-attempt history and progress-over-time analytics.
- Teacher/class analytics, spaced-repetition reminders, and LMS integrations.

## 6. Functional requirements

| ID | Requirement | Expected behavior |
|---|---|---|
| FR-01 | Authentication | Users can sign up/sign in; demo users enter a local workspace without auth. |
| FR-02 | Material upload | Validate supported file types, file size, and user ownership. |
| FR-03 | Text extraction | Extract text and preserve page/section metadata. |
| FR-04 | Topic mapping | Create a hierarchy of subjects, chapters, topics, and subtopics. |
| FR-05 | Diagnostic generation | Create questions from retrieved source chunks and attach citations. |
| FR-06 | Answer evaluation | Score responses and explain results using source evidence. |
| FR-07 | Gap report | Classify topics and show the evidence for each rating. |
| FR-08 | Revision plan | Rank tasks by weakness, importance, deadline, and available time. |
| FR-09 | Study assistant | Answer from retrieved material and disclose insufficient evidence. |
| FR-10 | Progress tracking | Store attempts and compare topic performance over time. |
| FR-11 | Material management | Search, rename, remove, and export supported materials. |
| FR-12 | Privacy | Restrict private documents and workspace records to their owner. |

## 7. Non-functional requirements

- **Security:** server-side authorization and Supabase RLS; never expose service-role keys in client code.
- **Privacy:** disclose storage and AI-provider processing; do not send content to external models without notice.
- **Reliability:** handle invalid files, extraction errors, empty retrieval, AI timeouts, and database failures.
- **Accessibility:** readable contrast, keyboard focus, semantic labels, responsive layouts, and understandable errors.
- **Performance:** process large files asynchronously and limit context sent to an LLM.
- **Explainability:** show evidence and reasons for topic classifications rather than unexplained percentages.
- **Maintainability:** typed interfaces, reusable components, migrations, automated checks, and clear configuration.
- **Portability:** support local development and repeatable deployment.

## 8. Technology stack

### Current implementation
- **Next.js App Router:** application framework and server routes.
- **React:** interactive user interface.
- **TypeScript:** type safety.
- **Lucide React:** interface icons.
- **CSS:** responsive layouts and dark visual theme.
- **Supabase Auth:** email/password authentication.
- **Supabase PostgreSQL:** workspace, material metadata/content, and activity records with row-level security.
- **Render:** hosted Node web service and deployment from the main branch.

### Recommended additions for the full AI system
- **Document extraction:** a maintained PDF parser such as pdfjs-dist or an equivalent server-side library.
- **Embeddings/vector retrieval:** Supabase pgvector with a suitable embedding model.
- **Generation/evaluation:** a server-side LLM provider such as Gemini, OpenAI, or Groq behind a provider abstraction.
- **Background processing:** a queue or asynchronous job runner for large documents.
- **Validation:** schema validation for requests and model output.
- **Testing:** unit tests, database/RLS integration tests, and end-to-end tests.

These are recommendations, not a claim that they are already wired into production.

## 9. System architecture

### Current architecture

    Browser UI (Next.js / React / TypeScript)
        ├── Overview, Materials, Topic Map
        ├── Diagnostic Quiz, Revision Plan
        ├── Study Assistant, Local Demo Mode
        ├── Next.js Study Assistant API route
        └── Supabase Auth and PostgreSQL
              ├── study_workspaces
              ├── materials
              └── study_activity
                  with row-level security

The demo workspace is local-only. It does not authenticate as a shared account and must not access other users' private records.

### Target architecture for full RAG and diagnosis

    Syllabus / notes / textbook / past papers
                      |
                      v
        File validation and text extraction
                      |
                      v
        Clean text + page/section metadata
                      |
                      v
        Semantic chunking with overlap
                      |
                      v
        Embedding model -> vector embeddings
                      |
                      v
        PostgreSQL + pgvector index
                      |
             +--------+---------+
             |                  |
             v                  v
       Retrieve chunks     Topic/syllabus map
             |                  |
             v                  |
       Grounded question         |
          generation             |
             |                  |
             v                  |
       Student answers           |
             |                  |
             v                  |
       Evidence-based evaluation
             |
             v
       Topic-level gap analysis
             |
             v
       Prioritized adaptive revision plan
             |
             v
       Cited explanations and progress dashboard

## 10. RAG pipeline: retrieval and generation

Retrieval-Augmented Generation (RAG) combines search over the student's own materials with language generation. Retrieval and generation should remain distinct, observable stages.

### 10.1 Ingestion
1. Validate file extension, MIME type, size, and user ownership.
2. Extract text from supported formats.
3. Preserve provenance: user ID, document ID, filename, page, heading, and character offsets where possible.
4. Normalize whitespace and remove repeated headers/footers when safe.
5. Split content into semantic chunks. A starting experiment might use 500–900 tokens per chunk with 80–150 tokens of overlap; tune this using evaluation.
6. Create embeddings on the server and store chunk text, metadata, and vectors in a private database table.
7. Show ingestion status: queued, processing, indexed, or failed.

### 10.2 Retrieval
1. Identify the relevant course, material, and topic.
2. Embed the query with the same model used for indexing.
3. Search only chunks the current user may access.
4. Retrieve ranked relevant chunks; optionally combine vector similarity with keyword search.
5. Apply a relevance threshold and remove near-duplicates.
6. Carry citations (document title, page, section, and chunk reference) with each result.
7. If evidence is insufficient, say so rather than inventing an answer.

### 10.3 Generation
Send the LLM only the retrieved evidence, task instructions, and a constrained output schema. Instruct it to use the supplied evidence, cite claims to source IDs, distinguish evidence from inference, never fabricate page numbers, and return an insufficient-evidence result when context is inadequate.

### 10.4 RAG quality checks
- Citation validity: each citation resolves to a real stored chunk.
- Groundedness: factual claims are supported by cited text.
- Retrieval recall: relevant source chunks appear in top-k results.
- Question validity: each question is answerable from cited sources.
- Answerability: avoid ambiguous questions and multiple correct answers unless intended.
- Privacy isolation: retrieval never returns another user's chunks.

## 11. AI workflow

### A. Topic mapping
Use syllabus headings and extracted content to build a topic hierarchy. Normalize duplicates and allow the student to edit or confirm the map. Link each topic to supporting source chunks.

### B. Diagnostic question generation
Generate questions only after retrieval. Each question should contain:
- question text and question type;
- options, if multiple-choice;
- answer key or grading rubric;
- evidence-based explanation;
- topic ID and difficulty estimate;
- citations to document/page/section/chunk;
- quality and ambiguity checks.

Use recall, conceptual understanding, application, and problem-solving questions. Avoid questions that depend on outside knowledge unless explicitly requested.

### C. Answer evaluation
For multiple-choice questions, compare the selected answer with the answer key and explain why it is correct or incorrect using evidence. For free-text answers, use a rubric with required concepts, partial credit, and a confidence flag. Test LLM scoring against human-scored examples.

### D. Gap analysis
Aggregate evidence per topic over multiple questions. Do not label a topic strong based on one easy question. Store attempts, correctness/partial credit, difficulty, question type, confidence, evidence, and attempt dates.

Illustrative starting thresholds that require calibration:
- **Strong:** 80% or higher with sufficient evidence, for example at least five questions across more than one question type.
- **Medium:** 50–79%, or mixed evidence.
- **Needs focus:** below 50%.
- **Not enough evidence:** too few attempts or low-confidence evaluation.

The “not enough evidence” state prevents missing data from being confused with poor knowledge.

### E. Revision-plan generation
Rank topics using weakness, syllabus importance, exam date/time available, prerequisites, time since last successful review, and recent improvement. Convert the ranking into short tasks with estimated duration, a concrete action, and a success criterion. Recompute after new diagnostic attempts or completed sessions. Allow the learner to override the schedule.

### F. Explain-this-topic assistant
Retrieve evidence first, then generate a cited explanation. Useful modes include simple explanation, worked example, compare concepts, and practice question. If the uploaded material lacks evidence, say so and invite the learner to add a source.

## 12. Gap report design

Each topic report should show:
- topic name and rating;
- score and number of attempts;
- evidence sufficiency/confidence;
- reason for the rating;
- missed concepts or questions;
- source citations;
- recommended next action;
- trend compared with previous attempts.

Avoid presenting unsupported mastery percentages as validated educational measurements. Mark sample data, estimates, and low-confidence conclusions clearly.

## 13. Personalized revision planning

Inputs include topic-level gap report, time available per day/week, exam date, topic weight, prerequisites, recent performance, and review history.

Outputs should include prioritized tasks, duration and due date, activity type (review, retrieval practice, worked example, spaced review), success criterion, and links to source material/practice questions.

A priority score can combine weakness, importance, and urgency. Document and test the formula; do not claim scientific validation without evaluation.

## 14. Database and data model

The current project documentation identifies these Supabase tables:
- **materials:** material metadata/content associated with a user.
- **study_workspaces:** serialized workspace state for a user.
- **study_activity:** events such as quiz completion, assistant usage, and revision task completion.

RLS is intended to restrict private rows to the authenticated owner.

### Recommended tables for full RAG

| Table | Purpose | Key fields |
|---|---|---|
| profiles | User preferences | user_id, display_name, timezone |
| courses | Course/subject | id, user_id, title, exam_date |
| materials | Uploaded documents | id, user_id, course_id, filename, status |
| document_chunks | Extracted text/provenance | id, material_id, chunk_text, page, section, embedding |
| topics | Topic hierarchy | id, course_id, parent_id, title |
| topic_sources | Topic-to-evidence links | topic_id, chunk_id, relevance |
| questions | Generated questions | id, topic_id, prompt, answer key, rubric, citations |
| quiz_attempts | Attempt results | id, user_id, question_id, response, score, created_at |
| topic_mastery | Topic estimate | user_id, topic_id, score, confidence, evidence_count |
| revision_tasks | Personalized plan | id, user_id, topic_id, due_at, duration, status |
| study_activity | Audit/usage events | user_id, event_type, details, created_at |

Apply RLS to every user-owned table. Do not trust arbitrary client-supplied user IDs. Vector queries should enforce ownership in the database or a secure server-side function.

## 15. Security, privacy, and demo access

- Keep private keys and AI-provider keys server-side only.
- Use environment variables; never commit secrets or print them in logs.
- Treat RLS as a database boundary, not just a UI convention.
- Validate every API request, file type, file size, and resource ownership.
- Use signed, short-lived file URLs if private object storage is added.
- Provide data deletion/export and explain retention.
- Disclose if document content is sent to an external AI provider.
- Avoid unnecessary personal information in activity logs.
- Treat retrieved document text as untrusted input; it must not override system instructions.
- Demo mode uses local browser storage. It is not cloud-synced, may not follow the learner across devices, and can be lost if browser data is cleared.
- Do not use sensitive real documents in a public judging demo.

## 16. Demo and judging walkthrough

Suggested five-minute demo:
1. Open the hosted app and enter the demo workspace.
2. Show the overview and explain the diagnosis-first goal.
3. Open Materials, inspect sample notes, and add a TXT/Markdown file.
4. Search the material list and export current notes as Markdown.
5. Run the diagnostic quiz and explain how answers should update topic ratings.
6. Open Topic Map and Revision Plan.
7. Ask the Study Assistant a question about the supplied material; show citations once RAG is implemented.
8. Explain that demo data is local-only while signed-in workspaces use Supabase and RLS.
9. Disclose prototype limitations and the planned RAG pipeline.

**Judging honesty:** the current prototype includes illustrative built-in questions and estimates. Do not claim full material-grounded RAG or PDF extraction until those features are implemented and tested.

## 17. Installation and local development

### Prerequisites
- Node.js 20.9 or newer.
- npm.
- Git.
- A Supabase project for authenticated cloud features.

### Setup
1. Clone the repository: https://github.com/loukika-12/GapFinderAI
2. Open a terminal in the project directory and run npm install.
3. Create a local environment file named .env.local, based on .env.example if present.
4. Configure the following values:

    NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY

5. Run npm run dev and open the local URL printed by Next.js, normally http://localhost:3000.
6. Run npm run lint for TypeScript validation.
7. Run npm run build to test a production build.

Never commit .env.local. Do not put a Supabase service-role key in a NEXT_PUBLIC variable. If .env.example is absent, create .env.local manually with the required values.

## 18. Supabase setup

1. Create or select a Supabase project.
2. Configure Authentication URL settings with the local URL and hosted Render URL as allowed redirects.
3. Enable email/password authentication as required by the sign-in flow.
4. Apply SQL migrations from the repository's supabase/migrations directory.
5. Confirm materials, study_workspaces, and study_activity exist and RLS is enabled.
6. Test with two separate accounts to ensure one user cannot access another user's rows.
7. Add the project URL and publishable key to Render environment settings.
8. Keep service-role and AI-provider keys server-only.

Verify exact SQL definitions against the repository migrations before configuring a new environment.

## 19. Deployment on Render

The service is configured to deploy the main branch. Typical settings:
- **Service type:** Node web service.
- **Build command:** npm install && npm run build
- **Start command:** npm run start
- **Environment variables:** NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, plus server-only AI keys only if the matching AI implementation is enabled.
- **Auto-deploy:** enabled for pushes to the configured branch.

After each push, inspect Render deployment logs and GitHub Actions. A pushed commit is not necessarily live yet. Confirm deployment status and then hard-refresh the hosted site. Consider a suitable paid plan if cold starts, resource limits, or reliability become a concern.

## 20. Environment variable reference

| Variable | Purpose | Exposure |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Public client configuration |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Supabase publishable key | Public client configuration; database access must be protected by RLS |
| AI provider key | Calls an LLM from a server route | Server only; never use NEXT_PUBLIC prefix |
| Embedding provider key | Creates embeddings, if separate | Server only |

Only configure AI or embedding keys if the corresponding server-side implementation exists. A configured secret alone does not mean a feature is implemented.

## 21. Testing and evaluation plan

### Functional tests
- Demo access works without email or account creation.
- Sign-up/sign-in and sign-out work.
- Users can edit, save, search, and export notes.
- Unsupported file types show a clear error.
- Quiz navigation, scoring, reset, and completion behave correctly.
- Revision tasks can be checked and reset.
- Cloud sync handles success, failure, and offline conditions.
- Mobile layout and keyboard navigation remain usable.

### AI/RAG evaluation (required before claiming full AI capability)
- Create a reviewed corpus with known answers and source locations.
- Measure retrieval recall@k and citation validity.
- Score questions for answerability, ambiguity, coverage, and source alignment.
- Compare automatic answer scoring with human grading.
- Test gap-report stability and minimum evidence counts.
- Evaluate revision recommendations against teacher/expert priorities.
- Test adversarial document text and prompt injection.
- Test cross-user data isolation.
- Record model/provider, prompt version, retrieval parameters, and evaluation results.

### Suggested acceptance criteria
- Every generated question resolves to real source chunks.
- Every citation opens the correct document/page/section.
- The assistant qualifies or declines answers when retrieval is insufficient.
- No user can retrieve another user's materials.
- Topic ratings show low-confidence/not-enough-evidence states when appropriate.
- New diagnostic evidence changes topic priorities and the revision plan reproducibly.

## 22. Known limitations

1. PDF files can be listed, but PDF text extraction is not implemented in the current prototype.
2. Built-in diagnostic questions and topic estimates are illustrative, not dynamically grounded in uploaded material.
3. Full RAG with chunk embeddings, vector retrieval, and citations remains a target feature.
4. Topic mastery needs more robust evidence aggregation and attempt history.
5. Demo progress uses browser storage and is not cloud-synced.
6. Markdown export exports current notes, not a complete archive of every uploaded file.
7. Teacher dashboards, parent views, multilingual support, reminders, and LMS integrations are future enhancements.
8. Educational predictions are guidance, not a definitive measure of a student's ability.

## 23. Future roadmap

### Phase 1 — Foundations
- Document extraction and normalized material storage.
- Course/syllabus/topic models and editable topic mapping.
- Per-user upload management and deletion.
- Automated tests and observability.

### Phase 2 — RAG
- Chunking, embeddings, pgvector, retrieval filters, and citations.
- Grounded question generation and evidence-based answer evaluation.
- RAG quality evaluation and insufficient-evidence handling.

### Phase 3 — Diagnosis and adaptation
- Topic confidence and evidence counts.
- Attempt history and progress charts.
- Time-aware revision planning and recalculation.
- Spaced-repetition schedule.

### Phase 4 — Classroom and scale
- Teacher/class analytics with consent and appropriate access controls.
- Parent/mentor sharing controlled by the learner.
- Multi-subject and multilingual support.
- LMS integrations, accessibility audit, and production monitoring.

## 24. Expected deliverables

- Source repository with clear structure and environment example.
- Hosted application and repeatable deployment instructions.
- Demo route and sample content.
- Architecture diagram and RAG/AI workflow.
- Database migrations and RLS policies.
- Functional test results and AI evaluation report.
- User-facing limitations, privacy information, and roadmap.

## 25. Conclusion

GapFinder AI aims to move study support from reactive answers toward proactive diagnosis. Its distinguishing value is the connection between source material, assessment evidence, explainable topic-level gaps, and a revision plan that adapts as the learner improves. The current prototype establishes the workspace, authentication/storage foundations, and core study flow. The next major engineering milestone is a fully evaluated, citation-grounded RAG pipeline, followed by reliable diagnosis and adaptive planning. The project should be judged on evidence that its questions, ratings, and recommendations are grounded, useful, and secure—not on interface polish alone.
