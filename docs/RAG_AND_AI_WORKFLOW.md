# GapFinder AI — RAG Pipeline and AI Workflow

[Back to repository README](../README.md) · [Architecture overview](ARCHITECTURE.md) · [Full project documentation](PROJECT_DOCUMENTATION.md)

> **Status:** This file describes the required target pipeline. Full RAG with embeddings, vector retrieval, source-cited question generation, and verified material-grounded answers is not yet implemented in the current prototype.

## 1. Retrieval-Augmented Generation (RAG)

RAG separates **retrieval** (finding relevant evidence in a student's own material) from **generation** (producing an answer or question using that evidence). The model should not be asked to invent source citations.

## 2. Ingestion pipeline

1. Validate file extension, MIME type, size, and ownership.
2. Extract text from PDF/TXT/Markdown and retain document title, page, section, and offsets.
3. Normalize whitespace and remove repeated headers where safe.
4. Split into semantic chunks. A starting experiment is 500–900 tokens with 80–150 token overlap; evaluate and tune this against the source corpus.
5. Create embeddings using a server-side embedding model.
6. Store chunk text, metadata, embedding, owner ID, and material ID in a private PostgreSQL table with pgvector.
7. Track processing state and surface failures to the user.

## 3. Retrieval pipeline

1. Convert the user's question or generation task into an embedding.
2. Search only chunks owned by the current user and allowed course/material.
3. Rank relevant chunks by semantic similarity; optionally combine vector search with keyword search.
4. Apply relevance thresholds, deduplicate, and keep the best context.
5. Preserve each chunk's document/page/section citation.
6. If no suitable evidence is found, return an insufficient-evidence response.

## 4. Generation pipeline

Pass the model the task, retrieved context, source IDs, and a strict output schema. The model must:
- answer from the supplied context only;
- cite source IDs for factual claims;
- not fabricate documents, pages, or quotations;
- distinguish evidence from inference;
- return a structured insufficient-evidence result when needed.

A server-side validator should confirm that every generated citation maps to a real chunk before showing it to the student.

## 5. Diagnostic question generation

Each generated question should include:
- prompt and question type;
- options where appropriate;
- correct answer or scoring rubric;
- explanation grounded in the source;
- topic ID and estimated difficulty;
- source citation(s);
- quality checks for ambiguity and answerability.

Generate questions only from retrieved material, not from general model memory. Use a mix of recall, conceptual understanding, application, and problem-solving.

## 6. Answer evaluation

- Multiple choice: compare with the validated answer key and explain with source evidence.
- Free text: use a rubric, required concepts, partial credit, and confidence.
- Keep the student's original answer, score, feedback, question ID, and timestamp for progress analysis.
- Test automatic scores against human-scored examples.

## 7. Gap analysis

Aggregate multiple question attempts per topic. A suggested starting rule (requires calibration) is:
- Strong: at least 80% correct with adequate evidence across multiple question types.
- Medium: 50–79% or mixed evidence.
- Needs focus: below 50%.
- Not enough evidence: too few attempts or low-confidence scoring.

Display score, number of attempts, confidence, missed concepts, citations, and recommended next action. Never equate missing evidence with low ability.

## 8. Adaptive revision plan

Rank topic tasks using weakness, exam importance, deadline, time available, prerequisites, time since review, and recent improvement. Each task should contain an action, duration, due date, source link, and success criterion. Recompute the plan when a new diagnostic result or study session changes the evidence.

## 9. Evaluation and safety

- Retrieval recall@k on a reviewed benchmark.
- Citation validity and groundedness.
- Question answerability, ambiguity, and syllabus coverage.
- Answer-score agreement with human graders.
- Stability and calibration of topic ratings.
- Usefulness of plan priorities judged by teachers or subject experts.
- Prompt-injection resistance for uploaded documents.
- Strict cross-user isolation for retrieval and stored data.

## 10. Current limitation

The current prototype has a study-assistant interface and built-in illustrative quiz/topic data. PDF text extraction, vector embeddings, pgvector retrieval, citations verified against uploaded sources, and dynamically grounded quiz generation must be implemented and evaluated before claiming full RAG support.
