import { NextResponse } from "next/server";

export const runtime = "nodejs";

function makeStudyAnswer(question: string, context: string, materialName: string) {
  const q = question.toLowerCase();
  const notes = context.trim();
  const title = materialName.trim() || "your course material";

  if (!notes) {
    if (/summari[sz]e|key concepts|main points/.test(q)) {
      return "I can help you make a summary, but you haven't added course notes yet. Open Materials, paste your notes, and ask again.\n\nA useful summary includes: the main idea, key definitions, 3–5 important points, one example, and any questions you still have.";
    }
    if (/practi[cs]|study|prepare|revise|revision/.test(q)) {
      return "Try this focused study cycle:\n\n1. Choose one small learning objective.\n2. Read the relevant section once.\n3. Close your notes and explain the idea in your own words.\n4. Solve two practice questions.\n5. Check mistakes and revisit only the weak points.\n\nAdd your course notes in Materials for more context-specific help.";
    }
    return "I'm the built-in GapFinder study helper. I can help you structure revision and work with notes you provide, but I don't have a connected large language model in this no-API mode.\n\nFor a more specific answer, paste the relevant notes in Materials and ask a focused question.";
  }

  const words = notes.split(/\s+/).filter(Boolean);
  const sentences = notes.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  if (/summari[sz]e|key concepts|main points/.test(q)) {
    const excerpt = sentences.slice(0, 8).join("\n• ");
    return "Summary of " + title + ":\n\n• " + excerpt.slice(0, 5000) + (sentences.length > 8 ? "\n\nMore notes are available. Ask about a specific heading or concept to narrow this down." : "") + "\n\nThis summary is extracted from your supplied text, not independently verified.";
  }
  if (/quiz|test me|practice questions|questions/.test(q)) {
    const points = sentences.filter(s => s.length > 20).slice(0, 5);
    if (!points.length) return "Your notes are too short to create useful practice prompts. Add more material, then ask me to make practice questions.";
    return "Practice questions based on " + title + ":\n\n" + points.map((s, i) => (i + 1) + ". Explain this idea in your own words: " + s.slice(0, 220)).join("\n\n") + "\n\nTry answering without looking at your notes, then compare your response with the original text.";
  }
  if (/explain|what is|define|meaning of|how does/.test(q)) {
    const terms = q.replace(/explain|what is|define|meaning of|how does|please|can you|tell me about|\?/g, "").trim();
    const relevant = sentences.filter(s => !terms || s.toLowerCase().includes(terms) || terms.split(/\s+/).some(t => t.length > 3 && s.toLowerCase().includes(t))).slice(0, 5);
    if (relevant.length) return "Relevant points from " + title + ":\n\n• " + relevant.join("\n• ") + "\n\nIn simple terms, use these points as the basis for your explanation. This no-API helper extracts relevant text; it does not generate or verify new facts.";
  }
  const excerpt = words.slice(0, 180).join(" ");
  return "I found your notes for " + title + ".\n\n" + excerpt + (words.length > 180 ? "…" : "") + "\n\nTry asking “Summarize the key concepts”, “Make practice questions”, or “Explain [a term]” to work with your notes. This built-in mode uses text matching and does not call Gemini.";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = typeof body.question === "string" ? body.question.trim().slice(0, 2000) : "";
    const context = typeof body.context === "string" ? body.context.slice(0, 18000) : "";
    const materialName = typeof body.materialName === "string" ? body.materialName.slice(0, 200) : "";

    if (!question) {
      return NextResponse.json({ error: "Please enter a question." }, { status: 400 });
    }

    const answer = makeStudyAnswer(question, context, materialName);
    return NextResponse.json({
      answer,
      source: context.trim() ? "Built-in study helper · your notes" : "Built-in study helper · study guidance"
    });
  } catch {
    return NextResponse.json({ error: "Could not process that question. Please try again." }, { status: 500 });
  }
}
