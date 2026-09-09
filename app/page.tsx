"use client";

import { useMemo, useState } from "react";

type Team = "Academic" | "Operations";
type Question = {
  id: string;
  title: string;
  type: "single" | "multi" | "text";
  options?: string[];
  note?: string;
};

const academicQuestions: Question[] = [
  { id: "schoolDivision", title: "Your School / Division", type: "single", options: ["Heritage", "Bilingual", "DAIS Elementary", "DAIS Secondary", "Boarding"] },
  { id: "department", title: "Your Department", type: "single", options: ["Early Years", "Elementary", "Middle School", "High School", "Math", "English", "Social Studies", "Mandarin", "Science", "PE / Athletics / ASA", "Art / Design", "Performing Arts", "Student Services", "EAL", "SLT+", "Office / Support Staff"] },
  { id: "monthAhead", title: "Which statement best describes how you are feeling about the month ahead?", type: "single", options: ["I’m doing great, I am ready for it", "I have a lot of work coming up, but I’m pacing myself and will get it all done", "I am holding steady", "I am overwhelmed and could use some additional support", "I am currently experiencing a lot of personal stress in my life", "I am currently experiencing a lot of professional stress at school", "More Specifically"] },
  { id: "lookingForward", title: "What are you most looking forward to in the coming month?", note: "Choose all that apply.", type: "multi", options: ["Something academic in class", "Something extracurricular", "A special event", "An athletic event", "Something personal", "Something professional", "Nothing", "More Specifically"] },
  { id: "notLookingForward", title: "What are you not looking forward to this coming month?", note: "Choose all that apply.", type: "multi", options: ["Something academic in class", "Something extracurricular", "A special event", "An athletic event", "Something personal", "Something professional", "Nothing", "More Specifically"] },
  { id: "focus", title: "This coming month you are planning to focus more on…", note: "Choose all that apply.", type: "multi", options: ["Student support", "Parent communication", "Grading / Student Feedback", "Administrative Tasks", "Getting Organized", "Personal Issues", "Professional Development", "Working on My Learning Environment", "Professional Relationships", "More Specifically"] },
  { id: "leadershipFeeling", title: "The past month you felt ______ by your Division Leaders.", type: "single", options: ["Supported", "Alienated", "Neglected", "Micro-Managed", "Reassured", "Burdened", "Empowered", "Other"] },
];

const operationsQuestions: Question[] = [
  { id: "department", title: "Your Department", type: "single", options: ["HR", "Finance", "Facilities", "Marketing", "Admissions", "Campus Village", "Catering", "IT"] },
  { id: "monthAhead", title: "Which statement best describes how you are feeling about the month ahead?", type: "single", options: ["I’m doing great, I am ready for it", "I have a lot of work coming up, but I’m pacing myself and will get it all done", "I am holding steady", "I am overwhelmed and could use some additional support", "I am currently experiencing a lot of personal stress in my life", "I am currently experiencing a lot of professional work-related stress", "More Specifically"] },
  { id: "lookingForward", title: "What are you most looking forward to in the coming month?", note: "Choose all that apply.", type: "multi", options: ["Working with colleagues on my team", "Completing a work task and/or project", "Special school event", "School athletic event", "New initiative and/or change", "Professional growth/development opportunity", "Nothing particular", "More Specifically"] },
  { id: "notLookingForward", title: "What are you not looking forward to this coming month?", note: "Choose all that apply.", type: "multi", options: ["Heavy workload and/or busy period", "Project and/or task deadlines", "Difficult Conversations", "New / Upcoming Changes", "Something personal", "Something professional", "Nothing particular", "More Specifically"] },
  { id: "focus", title: "This coming month you are planning to focus more on…", note: "Choose all that apply.", type: "multi", options: ["Supporting colleagues", "Completing key priorities and tasks", "Getting organized", "Communicating with other departments", "Personal wellbeing", "Creating balance between competing priorities", "Professional Development", "Working smarter and/or Improving Processes", "Professional Relationships", "More Specifically"] },
  { id: "leadershipFeeling", title: "The past month leadership has left you feeling…", type: "single", options: ["Supported", "Alienated", "Neglected", "Micro-Managed", "Reassured", "Burdened", "Empowered", "More Specifically"] },
];

export default function Home() {
  const [team, setTeam] = useState<Team | null>(null);
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const questions = team === "Academic" ? academicQuestions : operationsQuestions;
  const current = step >= 0 ? questions[step] : null;
  const progress = team ? ((step + 1) / (questions.length + 1)) * 100 : 0;

  const canContinue = useMemo(() => {
    if (step === -1) return !!team;
    if (!current) return false;
    const value = answers[current.id];
    if (current.type === "multi") return Array.isArray(value) && value.length > 0;
    return typeof value === "string" && value.trim().length > 0;
  }, [step, team, current, answers]);

  function chooseSingle(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMulti(id: string, value: string) {
    setAnswers((prev) => {
      const existing = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      return { ...prev, [id]: existing.includes(value) ? existing.filter((v) => v !== value) : [...existing, value] };
    });
  }

  async function next() {
    if (step === -1) return setStep(0);
    if (step < questions.length - 1) return setStep((s) => s + 1);

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team,
          surveyMonth: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date()),
          answers,
          otherText,
          submittedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setDone(true);
    } catch {
      setError("We couldn’t submit your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function back() {
    setError("");
    if (step > 0) setStep((s) => s - 1);
    else if (step === 0) setStep(-1);
  }

  if (done) {
    return (
      <main className="shell">
        <section className="card">
          <div className="topbar"><div className="brand">WELLBEING STAFF SURVEY</div></div>
          <div className="success">
            <div>
              <div className="successIcon">✓</div>
              <h1 className="title" style={{ fontSize: "3rem" }}>Thank you.</h1>
              <p className="subtitle">Your response has been submitted. If you need support, please speak with your line manager so the appropriate level of support can be arranged.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="card">
        <div className="topbar"><div className="brand">WELLBEING STAFF SURVEY</div></div>
        <div className="progress"><div style={{ width: `${progress}%` }} /></div>

        <div className="content">
          {step === -1 ? (
            <>
              <div className="eyebrow">Monthly wellbeing survey</div>
              <h1 className="title">How has this month been for you?</h1>
              <p className="subtitle">This survey is completely anonymous. Start by choosing the team that best describes your role.</p>
              <div className="grid">
                {(["Academic", "Operations"] as Team[]).map((t) => (
                  <button key={t} className={`option ${team === t ? "selected" : ""}`} onClick={() => setTeam(t)}>
                    <strong>{t}</strong><span>{t === "Academic" ? "Teaching, learning and student-facing academic teams" : "Campus, service and operational teams"}</span>
                  </button>
                ))}
              </div>
            </>
          ) : current ? (
            <>
              <div className="eyebrow">Question {step + 1} of {questions.length}</div>
              <h1 className="title" style={{ fontSize: "clamp(2rem,4vw,3.2rem)" }}>{current.title}</h1>
              {current.note && <p className="subtitle">{current.note}</p>}

              <div className="choices">
                {current.options?.map((option) => {
                  const value = answers[current.id];
                  const selected = current.type === "multi" ? Array.isArray(value) && value.includes(option) : value === option;
                  return (
                    <button key={option} className={`option ${selected ? "selected" : ""}`} onClick={() => current.type === "multi" ? toggleMulti(current.id, option) : chooseSingle(current.id, option)}>
                      <strong>{option}</strong>
                    </button>
                  );
                })}
              </div>

              {(() => {
                const value = answers[current.id];
                const wantsOther = current.type === "multi" ? Array.isArray(value) && value.some((v) => v.includes("More Specifically")) : typeof value === "string" && (value.includes("More Specifically") || value === "Other");
                return wantsOther ? <input className="other" placeholder="Tell us more…" value={otherText[current.id] || ""} onChange={(e) => setOtherText((p) => ({ ...p, [current.id]: e.target.value }))} /> : null;
              })()}
            </>
          ) : null}

          {error && <div className="error">{error}</div>}

          <div className="footer">
            <div>{step >= 0 ? <button className="btn ghost" onClick={back}>← Back</button> : <span className="small">Takes about 2–3 minutes</span>}</div>
            <button className="btn primary" disabled={!canContinue || submitting} onClick={next}>{submitting ? "Submitting…" : step === questions.length - 1 ? "Submit response" : "Continue →"}</button>
          </div>
        </div>
      </section>
    </main>
  );
}
