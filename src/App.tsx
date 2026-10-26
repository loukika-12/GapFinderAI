"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import {
  BookOpen, BrainCircuit, Check, ChevronRight, CircleHelp, FileText,
  GraduationCap, LayoutDashboard, ListChecks, Menu, MessageCircle,
  Plus, Sparkles, Target, Upload, X, Zap
} from "lucide-react";

type Question = { topic: string; question: string; options: string[]; answer: number; explanation: string; source: string };
type Topic = { name: string; level: "Strong" | "Medium" | "Needs focus"; score: number; description: string };

const initialTopics: Topic[] = [
  { name: "Core concepts", level: "Strong", score: 86, description: "Definitions and foundational ideas" },
  { name: "Problem solving", level: "Medium", score: 61, description: "Applying concepts to examples" },
  { name: "Advanced applications", level: "Needs focus", score: 34, description: "Multi-step and applied questions" },
  { name: "Key terminology", level: "Medium", score: 68, description: "Important terms and relationships" },
];
const questions: Question[] = [
  { topic: "Core concepts", question: "What is the most effective first step when studying a new topic?", options: ["Memorize every paragraph", "Identify the main concepts and learning objectives", "Skip examples", "Study only the summary"], answer: 1, explanation: "Learning objectives and key concepts create a structure for later details.", source: "Sample course material · Study fundamentals" },
  { topic: "Problem solving", question: "After getting a practice question wrong, what should you do next?", options: ["Move on immediately", "Repeat the same answer", "Review the reasoning and try a similar problem", "Avoid that topic"], answer: 2, explanation: "Reviewing the reasoning and applying it again helps reveal and close the knowledge gap.", source: "Sample course material · Practice strategies" },
  { topic: "Advanced applications", question: "Which approach best tests whether you can apply a concept in a new situation?", options: ["Reread the same definition", "Copy the example verbatim", "Explain the title", "Solve a new scenario using the concept"], answer: 3, explanation: "A new scenario checks transfer of understanding rather than simple recognition.", source: "Sample course material · Applied learning" },
  { topic: "Key terminology", question: "Why is it useful to define unfamiliar terms in your own words?", options: ["It checks understanding beyond rote recall", "It makes the material longer", "It replaces practice", "It avoids connecting ideas"], answer: 0, explanation: "Restating a term in your own words tests whether you understand its meaning.", source: "Sample course material · Active recall" },
  { topic: "Problem solving", question: "Which is a useful revision cycle?", options: ["Read once and stop", "Test, review errors, practise, then retest", "Revise only strong topics", "Study without a goal"], answer: 1, explanation: "A test-review-practise-retest cycle focuses effort on gaps and checks improvement.", source: "Sample course material · Revision cycle" },
];

const navItems = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Materials", icon: FileText },
  { name: "Topic map", icon: BrainCircuit },
  { name: "Diagnostic quiz", icon: ListChecks },
  { name: "Revision plan", icon: Target },
  { name: "Study assistant", icon: MessageCircle },
];

function WorkspaceApp({ user, onSignOut, demoMode = false, onExitDemo }: { user: User | null; onSignOut: () => void; demoMode?: boolean; onExitDemo?: () => void }) {
  const [page, setPage] = useState("Overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [materialName, setMaterialName] = useState("Introduction to Learning");
  const [materialText, setMaterialText] = useState("");
  const [uploaded, setUploaded] = useState<string[]>(["Sample course notes.txt"]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantHistory, setAssistantHistory] = useState<{q:string;a:string;source:string}[]>([]);
  const [notice, setNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Load a signed-in user's workspace from Supabase; keep local-only demo mode useful too.
  useEffect(() => {
    let cancelled = false;
    const applySaved = (data: any) => {
      if (typeof data?.materialName === "string") setMaterialName(data.materialName);
      if (typeof data?.materialText === "string") setMaterialText(data.materialText);
      if (Array.isArray(data?.uploaded)) setUploaded(data.uploaded.filter((x: unknown) => typeof x === "string"));
      if (data?.answers && typeof data.answers === "object") setAnswers(data.answers);
      if (typeof data?.submitted === "boolean") setSubmitted(data.submitted);
      if (Array.isArray(data?.completed)) setCompleted(data.completed.filter((x: unknown) => typeof x === "string"));
      if (Array.isArray(data?.assistantHistory)) {
        setAssistantHistory(data.assistantHistory.filter((x: any) => x && typeof x.q === "string" && typeof x.a === "string" && typeof x.source === "string").slice(-30));
      }
    };
    const restore = async () => {
      try {
        const local = window.localStorage.getItem("gapfinder-workspace-v1");
        const localData = local ? JSON.parse(local) : null;
        if (user && supabase) {
          const { data, error } = await supabase.from("study_workspaces").select("workspace").eq("user_id", user.id).maybeSingle();
          if (error) throw error;
          if (data?.workspace && Object.keys(data.workspace).length) applySaved(data.workspace);
          else if (localData) applySaved(localData);
        } else if (localData) {
          applySaved(localData);
        }
      } catch (error) {
        console.error("Could not restore GapFinder workspace:", error);
        if (!user) showNotice("Saved browser data could not be read. You can continue with a fresh workspace.");
        else showNotice("Could not load cloud progress. Check your connection and refresh.");
      } finally {
        if (!cancelled) setHydrated(true);
      }
    };
    void restore();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Debounce cloud writes while typing; row-level security scopes each record to its owner.
  useEffect(() => {
    if (!hydrated) return;
    const workspace = {
      materialName, materialText, uploaded, answers, submitted, completed,
      assistantHistory: assistantHistory.slice(-30),
    };
    if (user && supabase) {
      const client = supabase;
      const currentUser = user;
      const timer = window.setTimeout(async () => {
        const { error } = await client.from("study_workspaces").upsert({
          user_id: currentUser.id,
          workspace,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
        if (error) {
          console.error("Workspace sync failed:", error.message);
          showNotice("Cloud sync failed. Your current work is still available in this tab.");
        }
      }, 900);
      return () => window.clearTimeout(timer);
    }
    try {
      window.localStorage.setItem("gapfinder-workspace-v1", JSON.stringify(workspace));
    } catch {
      showNotice("Browser storage is full. Try using shorter notes.");
    }
  }, [hydrated, user?.id, materialName, materialText, uploaded, answers, submitted, completed, assistantHistory]);

  const score = useMemo(() => {
    const total = Object.keys(answers).length;
    return total ? Math.round((Object.entries(answers).filter(([i, a]) => questions[Number(i)].answer === a).length / total) * 100) : 0;
  }, [answers]);
  const topics = useMemo(() => initialTopics.map((topic) => {
    const topicQs = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.topic === topic.name);
    const responded = topicQs.filter(({ i }) => answers[i] !== undefined);
    if (!submitted || !responded.length) return topic;
    const got = responded.filter(({ q, i }) => q.answer === answers[i]).length;
    const pct = Math.round(got / responded.length * 100);
    return { ...topic, score: pct, level: pct >= 75 ? "Strong" as const : pct >= 45 ? "Medium" as const : "Needs focus" as const };
  }), [answers, submitted]);

  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3500); };
  const recordActivity = async (eventType: "material_saved" | "assistant_answered" | "quiz_completed" | "revision_task_completed", title: string, details: Record<string, unknown> = {}) => {
    if (!user || !supabase) return;
    const { error } = await supabase.from("study_activity").insert({
      user_id: user.id,
      event_type: eventType,
      title: title.trim().slice(0, 200) || "Study activity",
      details,
    });
    if (error) throw new Error("Could not save study activity to Supabase.");
  };
  const saveMaterial = async () => {
    try {
      if (user && supabase) {
        const safeName = (materialName.trim() || "untitled-material").slice(0, 200);
        const slug = safeName.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 140) || "material";
        const storagePath = `${user.id}/${slug}.txt`;
        const content = materialText.slice(0, 500000) || "No text extracted. For PDFs, this demo stores metadata only; use TXT/Markdown or paste notes for analysis.";
        const sizeBytes = Math.max(1, new TextEncoder().encode(content).length);
        const { error } = await supabase.from("materials").upsert({
          user_id: user.id,
          name: safeName,
          mime_type: "text/plain",
          size_bytes: Math.min(sizeBytes, 10485760),
          storage_path: storagePath,
          content,
        }, { onConflict: "storage_path" });
        if (error) throw new Error("Could not save material to Supabase. Please try again.");
        await recordActivity("material_saved", safeName, { characterCount: materialText.length });
        showNotice("Material and study activity saved to your Supabase workspace.");
      } else {
        showNotice("Material saved in this browser. Sign in with Supabase to sync it across devices.");
      }
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Could not save material.");
    }
  };
  const go = (name: string) => { setPage(name); setMobileNav(false); };
  const addMaterial = async (file?: File) => {
    if (!file) return;
    const allowed = /\.(pdf|txt|md)$/i.test(file.name);
    if (!allowed) { showNotice("Please upload a PDF, TXT, or Markdown file."); return; }
    try {
      let text = "";
      if (/\.txt$|\.md$/i.test(file.name)) text = await file.text();
      else text = "PDF selected: " + file.name + ". For this lightweight demo, use TXT or Markdown notes to extract readable text in-browser.";
      setUploaded((old) => Array.from(new Set([...old, file.name])));
      setMaterialName(file.name.replace(/\.[^.]+$/, ""));
      setMaterialText(text.slice(0, 30000));
      showNotice(/\.pdf$/i.test(file.name) ? "PDF added. Upload TXT/Markdown for editable extracted text in this demo." : "Material loaded successfully.");
    } catch {
      showNotice("Could not read this file. Try a plain TXT or Markdown file.");
    }
  };
  const answerAssistant = async () => {
    const q = assistantQuestion.trim();
    if (!q || assistantLoading) return;
    setAssistantLoading(true);
    try {
      const response = await fetch("/api/study-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, context: materialText, materialName })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The AI could not answer right now.");
      setAssistantHistory(h => [...h, { q, a: data.answer, source: data.source || materialName || "Gemini AI" }]);
      try { await recordActivity("assistant_answered", q, { answer: data.answer, materialName }); } catch (error) { showNotice(error instanceof Error ? error.message : "AI answered, but history could not be recorded."); }
      setAssistantQuestion("");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Could not reach the Study Assistant. Please try again.");
    } finally {
      setAssistantLoading(false);
    }
  };
  const resetQuiz = () => { setAnswers({}); setQuizIndex(0); setSubmitted(false); };
  const toggleRevisionTask = (key: string) => {
    const isDone = completed.includes(key);
    setCompleted(current => isDone ? current.filter(item => item !== key) : [...current, key]);
    if (!isDone) {
      recordActivity("revision_task_completed", key).catch(() => showNotice("Task updated here, but database logging failed."));
    }
  };

  return (
    <div className="app-shell">
      <aside className={"sidebar " + (mobileNav ? "sidebar-open" : "")}>
        <div className="brand"><div className="brand-mark"><BrainCircuit size={22}/></div><div><strong>GapFinder<span> AI</span></strong><small>STUDY WITH DIRECTION</small></div><button className="icon-btn close-nav" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18}/></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>{navItems.map(item => { const Icon = item.icon; return <button key={item.name} onClick={() => go(item.name)} className={"nav-item " + (page === item.name ? "active" : "")}><Icon size={18}/><span>{item.name}</span>{item.name === "Diagnostic quiz" && <span className="nav-dot"/>}</button>; })}</nav>
        <div className="sidebar-bottom"><div className="focus-card"><div className="focus-icon"><Zap size={17}/></div><strong>Small steps, big progress.</strong><p>Your next session can start with just 15 focused minutes.</p><button onClick={() => go("Revision plan")}>View my plan <ChevronRight size={15}/></button></div><div className="profile"><div className="avatar">S</div><div className="profile-copy"><strong>{user?.email ? user.email.split("@")[0] : "Student workspace"}</strong><small>{user ? "Synced account" : "Demo account"}</small></div><span className="status-dot"/></div></div>
      </aside>
      {mobileNav && <button className="nav-overlay" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}
      <main className="main">
        <header className="topbar"><div className="topbar-left"><button className="icon-btn menu-btn" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20}/></button><span className="breadcrumb">Workspace <ChevronRight size={14}/> <strong>{page}</strong></span></div><div className="topbar-right"><span className="live-pill"><span/> {user ? "Cloud sync on" : "Local demo"}</span><button className="icon-btn" title="Help" onClick={() => showNotice("Use the left navigation to explore the demo.")}><CircleHelp size={18}/></button>{user && <button className="signout-btn" onClick={onSignOut}>Sign out</button>}{demoMode && <button className="signout-btn" onClick={onExitDemo}>Exit demo</button>}<div className="avatar small-avatar">{user?.email?.charAt(0).toUpperCase() || "S"}</div></div></header>
        <div className="page-wrap">
          {notice && <div className="toast"><Check size={16}/>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}
          {page === "Overview" && <Overview uploaded={uploaded} score={submitted ? score : null} topics={topics} onGo={go} completed={completed}/>}
          {page === "Materials" && <section className="page-section"><PageHeading eyebrow="YOUR KNOWLEDGE BASE" title="Course materials" description="Bring your syllabus and notes together. Your revision starts with what you're learning."/><div className="two-col"><div className="panel upload-panel"><div className="panel-title"><div className="panel-icon violet"><Upload size={19}/></div><div><h3>Upload learning materials</h3><p>PDF, TXT or Markdown · up to 10 MB</p></div></div><label className="dropzone"><input type="file" accept=".pdf,.txt,.md,text/plain,application/pdf,text/markdown" onChange={e => addMaterial(e.target.files?.[0])}/><div className="upload-orb"><Upload size={23}/></div><strong>Drop a file here or <span>browse files</span></strong><small>TXT and Markdown text can be read directly in this demo.</small></label><div className="field-label">Current course</div><input className="text-input" value={materialName} onChange={e => setMaterialName(e.target.value)} placeholder="Course name"/><div className="field-label">Extracted / pasted notes</div><textarea className="text-area" value={materialText} onChange={e => setMaterialText(e.target.value)} placeholder="Paste your notes here to make topic analysis and assistant answers more relevant..."/><button className="primary-btn" onClick={saveMaterial}>{<Check size={16}/>} Save material</button></div><div className="panel"><div className="panel-title"><div className="panel-icon blue"><BookOpen size={19}/></div><div><h3>Added materials</h3><p>{uploaded.length} item{uploaded.length===1?"":"s"} in this session</p></div></div><div className="file-list">{uploaded.map((name,i)=><div className="file-row" key={name}><div className="file-icon"><FileText size={18}/></div><div className="file-detail"><strong>{name}</strong><small>{i===0?"Example material · included with demo":"Uploaded in current session"}</small></div><span className="file-ready"><Check size={13}/> Ready</span></div>)}</div><div className="info-note"><Sparkles size={17}/><p><strong>Better results start with good notes.</strong><br/>Add clear topic headings and concise definitions. This demo uses built-in text matching and does not call an external AI service.</p></div></div></div></section>}
          {page === "Topic map" && <section className="page-section"><PageHeading eyebrow="UNDERSTAND YOUR PROGRESS" title="Topic map" description="See what feels solid and where another round of practice could help."/><div className="topic-grid">{topics.map((t,i)=><div className="panel topic-card" key={t.name}><div className={"topic-symbol t"+i}>{i===0?<BookOpen/>:i===1?<BrainCircuit/>:i===2?<Target/>:<GraduationCap/>}</div><span className={"level level-"+t.level.toLowerCase().replace(" ","-")}>{t.level}</span><h3>{t.name}</h3><p>{t.description}</p><div className="progress-line"><span style={{width:t.score+"%"}}/></div><div className="topic-meta"><strong>{t.score}% mastery</strong><span>{submitted ? "Based on quiz answers" : "Sample estimate"}</span></div></div>)}</div><div className="panel section-note"><Sparkles size={18}/><div><strong>How to read this map</strong><p>Mastery is a guide, not a final grade. Complete the diagnostic quiz to update topic estimates using your answers.</p></div><button className="secondary-btn" onClick={() => go("Diagnostic quiz")}>Take quiz <ChevronRight size={15}/></button></div></section>}
          {page === "Diagnostic quiz" && <section className="page-section"><PageHeading eyebrow="CHECK YOUR UNDERSTANDING" title="Diagnostic quiz" description="A quick knowledge check helps you decide what to revise first."/><div className="quiz-layout"><div className="panel quiz-panel">{submitted ? <div className="quiz-result"><div className="result-orb"><Target size={28}/></div><span className="eyebrow">YOUR DIAGNOSTIC RESULT</span><h2>{score}% <span>score</span></h2><p>{score >= 75 ? "A strong start. Keep your knowledge fresh with spaced review." : score >= 45 ? "You're building understanding. Focus on the topics that felt uncertain." : "Good starting point. Use the plan to work through the essentials step by step."}</p><div className="result-stats"><div><strong>{Object.keys(answers).length}</strong><small>Answered</small></div><div><strong>{Object.entries(answers).filter(([i,a]) => questions[+i].answer===a).length}</strong><small>Correct</small></div><div><strong>{topics.filter(t=>t.level==="Needs focus").length}</strong><small>Focus topics</small></div></div><button className="primary-btn" onClick={() => go("Revision plan")}>Build my revision plan <ChevronRight size={16}/></button><button className="text-btn" onClick={resetQuiz}>Retake quiz</button></div> : <><div className="quiz-top"><span className="quiz-tag">QUESTION {quizIndex+1} OF {questions.length}</span><span className="muted">{Math.round((quizIndex+1)/questions.length*100)}% complete</span></div><div className="progress-line quiz-progress"><span style={{width:((quizIndex+1)/questions.length*100)+"%"}}/></div><span className="topic-kicker">{questions[quizIndex].topic}</span><h2 className="question-title">{questions[quizIndex].question}</h2><div className="options">{questions[quizIndex].options.map((option,i)=><button key={option} className={"option "+(answers[quizIndex]===i?"option-selected":"")} onClick={() => setAnswers(a=>({...a,[quizIndex]:i}))}><span className="option-letter">{String.fromCharCode(65+i)}</span><span>{option}</span>{answers[quizIndex]===i&&<Check className="option-check" size={17}/>}</button>)}</div><div className="quiz-footer"><button className="secondary-btn" disabled={quizIndex===0} onClick={() => setQuizIndex(i=>i-1)}>Previous</button>{quizIndex<questions.length-1?<button className="primary-btn" onClick={() => { if(answers[quizIndex]===undefined){showNotice("Choose an answer to continue.");return;} setQuizIndex(i=>i+1); }}>Next question <ChevronRight size={16}/></button>:<button className="primary-btn" onClick={() => {if(Object.keys(answers).length<questions.length){showNotice("Answer every question before submitting.");return;} setSubmitted(true); recordActivity("quiz_completed", "Diagnostic quiz", { score, answered: Object.keys(answers).length }).then(() => showNotice(user ? "Diagnostic complete. Activity saved to Supabase." : "Diagnostic complete. Progress saved in this browser.")).catch(() => showNotice("Diagnostic complete, but database save failed."));}}>Submit diagnostic <Check size={16}/></button>}</div></>}</div><aside className="panel quiz-side"><div className="panel-icon violet"><BrainCircuit size={20}/></div><h3>Why a diagnostic?</h3><p>It helps you spend revision time on the concepts that need it most, rather than rereading everything.</p><div className="side-divider"/><div className="mini-benefit"><span><Target size={16}/></span><div><strong>Find gaps early</strong><small>Focus on the right topics.</small></div></div><div className="mini-benefit"><span><Zap size={16}/></span><div><strong>Revise with purpose</strong><small>Turn results into next steps.</small></div></div><div className="mini-benefit"><span><Check size={16}/></span><div><strong>Track improvement</strong><small>Retake to compare scores.</small></div></div></aside></div></section>}
          {page === "Revision plan" && <section className="page-section"><PageHeading eyebrow="YOUR NEXT BEST STEPS" title="Revision plan" description="A simple, flexible plan that starts with the topics needing the most attention."/><div className="plan-summary"><div><span className="eyebrow">YOUR DAILY TARGET</span><h2>30 <span>minutes</span></h2><p>Short focused sessions beat last-minute cramming.</p></div><div className="plan-ring"><strong>{completed.length}/4</strong><span>completed</span></div></div><div className="panel plan-list"><div className="plan-head"><div><h3>Your focus sessions</h3><p>Mark each step complete as you go.</p></div><span className="level level-medium">Adaptive demo plan</span></div>{[...topics].sort((a,b)=>a.score-b.score).map((t,i)=>{const task=["Review core definitions and write a short summary","Work through two practice examples without notes","Explain key terms aloud and check your wording","Retry the diagnostic questions you found difficult"][i];const key=t.name;return <div className="plan-row" key={key}><button className={"task-check "+(completed.includes(key)?"task-done":"")} onClick={()=>toggleRevisionTask(key)} aria-label={"Toggle "+key}>{completed.includes(key)?<Check size={16}/>:<span/>}</button><div className="plan-number">{String(i+1).padStart(2,"0")}</div><div className="plan-copy"><strong>{t.name}</strong><p>{task}</p><small><span/><BookOpen size={13}/> 10–15 min</small></div><span className={"level level-"+t.level.toLowerCase().replace(" ","-")}>{t.level}</span></div>})}<div className="plan-bottom"><span>{completed.length===4?"Nice work — you've completed this plan.":"Every checked task counts as progress."}</span><button className="text-btn" onClick={()=>setCompleted([])}>Reset checklist</button></div></div></section>}
          {page === "Study assistant" && <section className="page-section"><PageHeading eyebrow="LEARN WITH CONTEXT" title="Study assistant" description="Ask a question about your notes and get a response grounded in text you supplied."/><div className="assistant-layout"><div className="panel assistant-panel"><div className="assistant-banner"><div className="assistant-avatar"><Sparkles size={20}/></div><div><strong>Your study companion</strong><p>Built-in study helper · no API key required</p></div><span className="live-pill"><span/> Ready</span></div><div className="chat-area">{assistantHistory.length===0&&<div className="welcome-chat"><div className="welcome-orb"><MessageCircle size={22}/></div><h3>What are you working on?</h3><p>Ask about your notes, create practice prompts, or get structured study guidance. This built-in helper works without an external AI API.</p><div className="suggestion-row">{["Summarize the key concepts","How should I practise?","What should I revise first?"].map(s=><button key={s} className="suggestion" onClick={()=>setAssistantQuestion(s)}>{s}<ChevronRight size={14}/></button>)}</div></div>}{assistantHistory.map((item,i)=><div key={i} className="chat-exchange"><div className="chat-user"><span className="avatar">S</span><p>{item.q}</p></div><div className="chat-answer"><div className="assistant-avatar mini"><Sparkles size={15}/></div><div><p>{item.a}</p><small><FileText size={12}/> Source: {item.source}</small></div></div></div>)}</div><div className="chat-compose"><textarea value={assistantQuestion} onChange={e=>setAssistantQuestion(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();answerAssistant();}}} placeholder="Ask about a topic, definition or concept..." rows={2}/><button className="primary-btn" onClick={answerAssistant} disabled={!assistantQuestion.trim() || assistantLoading}>{assistantLoading ? "Thinking..." : "Ask"} <ChevronRight size={16}/></button></div><p className="privacy-line"><Check size={13}/> Your workspace is saved in this browser. Activity events are recorded in Supabase; your notes and chat are not shared publicly.</p></div><aside className="panel source-panel"><div className="panel-icon blue"><FileText size={18}/></div><h3>Current context</h3><p>The built-in helper matches text from the notes available in this browser.</p><div className="source-current"><FileText size={16}/><div><strong>{materialName || "Study fundamentals"}</strong><small>{materialText ? materialText.length+" characters loaded" : "Using built-in sample context"}</small></div></div><button className="secondary-btn full-btn" onClick={()=>go("Materials")}>Manage materials <ChevronRight size={15}/></button><div className="info-note compact"><CircleHelp size={16}/><p>For trustworthy answers, verify a response against your original course material.</p></div></aside></div></section>}
        </div>
      </main>
    </div>
  );
}

function PageHeading({eyebrow,title,description}:{eyebrow:string;title:string;description:string}) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div><div className="heading-mark"><Sparkles size={24}/></div></div>;
}
function Overview({uploaded,score,topics,onGo,completed}:{uploaded:string[];score:number|null;topics:Topic[];onGo:(v:string)=>void;completed:string[]}) {
  return <section className="page-section"><div className="welcome-head"><div><span className="eyebrow"><Sparkles size={13}/> YOUR PERSONAL STUDY SPACE</span><h1>Find your gaps.<br/><span>Own your learning.</span></h1><p>Turn your learning materials into a clearer picture of what you know — and what to focus on next.</p><div className="welcome-actions"><button className="primary-btn" onClick={()=>onGo("Diagnostic quiz")}>Start diagnostic <ChevronRight size={16}/></button><button className="secondary-btn" onClick={()=>onGo("Materials")}><Plus size={16}/> Add materials</button></div></div><div className="hero-art"><div className="hero-glow"/><div className="hero-card back-card"><span className="float-dot dot-a"/><span className="float-dot dot-b"/><div className="art-orbit orbit-a"/><div className="art-orbit orbit-b"/><div className="art-center"><BrainCircuit size={36}/></div><div className="art-tag tag-a"><Check size={13}/> Clear direction</div><div className="art-tag tag-b"><Target size={13}/> Focused progress</div></div></div></div><div className="stats-grid"><Stat icon={<FileText size={18}/>} label="Learning materials" value={uploaded.length.toString()} hint="Files in this session" color="violet"/><Stat icon={<BrainCircuit size={18}/>} label="Topics mapped" value={topics.length.toString()} hint="Concept areas to explore" color="blue"/><Stat icon={<Target size={18}/>} label="Diagnostic score" value={score===null?"—":score+"%"} hint={score===null?"Take your first quiz":"Latest completed quiz"} color="green"/><Stat icon={<Check size={18}/>} label="Plan progress" value={completed.length+"/4"} hint="Steps completed" color="amber"/></div><div className="dashboard-grid"><div className="panel focus-panel"><div className="panel-header"><div><span className="eyebrow">YOUR NEXT STEP</span><h3>Build a little momentum</h3></div><div className="panel-icon violet"><Zap size={19}/></div></div><p className="body-muted">A short diagnostic can help you trade vague revision for a plan that has purpose.</p><div className="next-step"><div className="next-icon"><ListChecks size={21}/></div><div><strong>Check what you know</strong><p>Answer a few quick questions and spot the topics worth revisiting.</p></div><button className="round-arrow" onClick={()=>onGo("Diagnostic quiz")} aria-label="Start diagnostic"><ChevronRight size={19}/></button></div><div className="next-step"><div className="next-icon teal"><BookOpen size={21}/></div><div><strong>Bring your course notes</strong><p>Use your own material as the starting point for learning.</p></div><button className="round-arrow" onClick={()=>onGo("Materials")} aria-label="Add material"><ChevronRight size={19}/></button></div><div className="next-step"><div className="next-icon amber"><Target size={21}/></div><div><strong>Make revision actionable</strong><p>Break the next session into manageable, focused tasks.</p></div><button className="round-arrow" onClick={()=>onGo("Revision plan")} aria-label="View revision plan"><ChevronRight size={19}/></button></div></div><div className="panel mastery-panel"><div className="panel-header"><div><span className="eyebrow">A SNAPSHOT</span><h3>Topic confidence</h3></div><button className="subtle-link" onClick={()=>onGo("Topic map")}>View map <ChevronRight size={14}/></button></div><p className="body-muted">Use these estimates to decide where to spend your attention.</p><div className="mastery-list">{topics.slice(0,4).map((t,i)=><div className="mastery-row" key={t.name}><div className={"mastery-icon m"+i}>{i===0?<BookOpen size={16}/>:i===1?<BrainCircuit size={16}/>:i===2?<Target size={16}/>:<GraduationCap size={16}/>}</div><div className="mastery-info"><div><strong>{t.name}</strong><span>{t.score}%</span></div><div className="progress-line"><span style={{width:t.score+"%"}}/></div></div></div>)}</div><div className="confidence-legend"><span><i className="legend-strong"/> Strong</span><span><i className="legend-medium"/> Developing</span><span><i className="legend-focus"/> Focus area</span></div></div></div><div className="bottom-banner"><div className="banner-spark"><Sparkles size={20}/></div><div><strong>Progress, not perfection.</strong><p>Every question you answer gives you a better idea of what to work on next.</p></div><button onClick={()=>onGo("Study assistant")}>Ask your study assistant <ChevronRight size={16}/></button></div><div className="disclaimer">Demo build · Quiz content and topic estimates are illustrative sample data until you add course-specific material.</div></section>;
}
function Stat({icon,label,value,hint,color}:{icon:React.ReactNode;label:string;value:string;hint:string;color:string}) {return <div className="panel stat-card"><div className={"stat-icon "+color}>{icon}</div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{hint}</small></div></div>}


function AuthGate() {
  const [user, setUser] = useState<User | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    let alive = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) setFeedback("Could not restore your session. Please sign in again.");
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);
  const signOut = async () => { if (supabase) await supabase.auth.signOut(); };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setFeedback("");
    try {
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) {
        setFeedback("Account created. Check your email to confirm your address, then sign in.");
      } else {
        setFeedback("");
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  if (!ready) return <div className="auth-loading"><div className="brand-mark"><BrainCircuit size={22}/></div><p>Preparing your study space…</p></div>;
  if (demoMode) return <WorkspaceApp user={null} onSignOut={() => {}} demoMode onExitDemo={() => setDemoMode(false)} />;
  if (!supabase) return <WorkspaceApp user={null} onSignOut={() => {}} />;
  if (user) return <WorkspaceApp user={user} onSignOut={() => { void signOut(); }} />;
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand"><div className="brand-mark"><BrainCircuit size={22}/></div><div><strong>GapFinder<span> AI</span></strong><small>STUDY WITH DIRECTION</small></div></div>
        <div className="auth-eyebrow">YOUR PERSONAL STUDY WORKSPACE</div>
        <h1>{mode === "signin" ? "Make your next study session count." : "Create your study space."}</h1>
        <p className="auth-intro">Bring your notes together, find learning gaps, and build a revision plan that feels manageable.</p>
        <form className="auth-form" onSubmit={submit}>
          <label>Email address<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
          <label>Password<input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required /></label>
          <button className="primary-btn auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in to your workspace" : "Create account"} <ChevronRight size={16}/></button>
        </form>
        {feedback && <div className="auth-feedback" role="status">{feedback}</div>}
        <p className="auth-switch">{mode === "signin" ? "New to GapFinder AI?" : "Already have an account?"} <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setFeedback(""); }}>{mode === "signin" ? "Create account" : "Sign in"}</button></p>
        <div className="auth-divider"><span>OR</span></div>
        <button className="secondary-btn demo-login-btn" type="button" onClick={() => { setFeedback(""); setDemoMode(true); }}>Continue with demo workspace <ChevronRight size={16}/></button>
        <p className="demo-login-note">Try the dashboard without signing in. Demo progress stays in this browser.</p>
        <div className="auth-security"><Check size={15}/> Private workspace · Supabase-secured account data</div>
      </section>
      <aside className="auth-aside">
        <div className="auth-aside-top"><span className="auth-pill"><Sparkles size={14}/> LEARN WITH CLARITY</span><h2>Less guessing.<br/><span>More progress.</span></h2><p>Study smarter with a clear view of what you know and what to focus on next.</p></div>
        <div className="auth-feature"><div className="auth-feature-icon"><BookOpen size={18}/></div><div><strong>One home for your notes</strong><p>Keep course materials organized in one place.</p></div></div>
        <div className="auth-feature"><div className="auth-feature-icon blue"><Target size={18}/></div><div><strong>Know what to practise</strong><p>Use short diagnostics to spot topics that need attention.</p></div></div>
        <div className="auth-feature"><div className="auth-feature-icon green"><ListChecks size={18}/></div><div><strong>A realistic revision plan</strong><p>Turn small steps into steady, visible progress.</p></div></div>
        <div className="auth-aside-foot">Your progress syncs to your account when cloud storage is configured.</div>
      </aside>
    </main>
  );
}

export default function GapFinderApp() {
  return <AuthGate />;
}
