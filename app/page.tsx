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
  { id: "schoolDivision", title: "Your School / Division", note: "(Choose one option that best defines your placement.)", type: "single", options: ["Heritage", "Bilingual", "DAIS Elementary", "DAIS Secondary", "Boarding"] },
  { id: "department", title: "Your Department", note: "(Choose one option that best defines your placement.)", type: "single", options: ["Early Years", "Elementary", "Middle School", "High School", "Math", "English", "Social Studies", "Mandarin", "Science", "PE / Athletics / ASA", "Art / Design", "Performing Arts", "Student Services", "EAL", "SLT+", "Office / Support Staff"] },
  { id: "monthAhead", title: "Which statement best describes how you are feeling about the month ahead?", type: "single", options: ["I’m doing great, I am ready for it", "I have a lot of work coming up, but I’m pacing myself and will get it all done", "I am holding steady", "I am overwhelmed and could use some additional support", "I am currently experiencing a lot of personal stress in my life", "I am currently experiencing a lot of professional stress at school", "More Specifically"] },
  { id: "lookingForward", title: "What are you most looking forward to in the coming month?", note: "(Check all that apply.)", type: "multi", options: ["Something academic in class", "Something extracurricular", "A special event", "An athletic event", "Something personal", "Something professional", "Nothing", "More Specifically"] },
  { id: "notLookingForward", title: "What are you not looking forward to this coming month?", note: "(Check all that apply.)", type: "multi", options: ["Something academic in class", "Something extracurricular", "A special event", "An athletic event", "Something personal", "Something professional", "Nothing", "More Specifically"] },
  { id: "focus", title: "This coming month you are planning to focus more on…", note: "(Check all that apply.)", type: "multi", options: ["Student support", "Parent communication", "Grading / Student Feedback", "Administrative Tasks", "Getting Organized", "Personal Issues", "Professional Development", "Working on My Learning Environment", "Professional Relationships", "More Specifically"] },
  { id: "leadershipFeeling", title: "The past month you felt ________________ by your Division Leaders.", note: "(Choose one.)", type: "single", options: ["Supported", "Alienated", "Neglected", "Micro-Managed", "Reassured", "Burdened", "Empowered", "Other"] },
];

const operationsQuestions: Question[] = [
  { id: "department", title: "Your Department", note: "(Choose one option that best defines your placement.)", type: "single", options: ["HR", "Finance", "Facilities", "Marketing", "Admissions", "Campus Village", "Catering", "IT"] },
  { id: "monthAhead", title: "Which statement best describes how you are feeling about the month ahead?", type: "single", options: ["I’m doing great, I am ready for it", "I have a lot of work coming up, but I’m pacing myself and will get it all done", "I am holding steady", "I am overwhelmed and could use some additional support", "I am currently experiencing a lot of personal stress in my life", "I am currently experiencing a lot of professional work-related stress", "More Specifically"] },
  { id: "lookingForward", title: "What are you most looking forward to in the coming month?", note: "(Check all that apply.)", type: "multi", options: ["Working with colleagues on my team", "Completing a work task and/or project", "Special school event", "School athletic event", "New initiative and/or change", "Professional growth/development opportunity", "Nothing particular", "More Specifically"] },
  { id: "notLookingForward", title: "What are you not looking forward to this coming month?", note: "(Check all that apply.)", type: "multi", options: ["Heavy workload and/or busy period", "Project and/or task deadlines", "Difficult Conversations", "New / Upcoming Changes", "Something personal", "Something professional", "Nothing particular", "More Specifically"] },
  { id: "focus", title: "This coming month you are planning to focus more on…", note: "(Check all that apply.)", type: "multi", options: ["Supporting colleagues", "Completing key priorities and tasks", "Getting organized", "Communicating with other departments", "Personal wellbeing", "Creating balance between competing priorities", "Professional Development", "Working smarter and/or Improving Processes", "Professional Relationships", "More Specifically"] },
  { id: "leadershipFeeling", title: "The past month leadership has left you feeling: ________________", note: "(Choose one.)", type: "single", options: ["Supported", "Alienated", "Neglected", "Micro-Managed", "Reassured", "Burdened", "Empowered", "More Specifically"] },
];

function needsSpecificText(value: string | string[] | undefined) {
  if (!value) return false;
  if (Array.isArray(value)) return value.some((v) => v.includes("More Specifically"));
  return value.includes("More Specifically") || value === "Other";
}

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
  const headerTitle = team ? `MONTHLY ${team.toUpperCase()} TEAM WELLBEING SURVEY` : "WELLBEING STAFF SURVEY";

  const canContinue = useMemo(() => {
    if (step === -1) return !!team;
    if (!current) return false;

    const value = answers[current.id];
    const hasAnswer = current.type === "multi"
      ? Array.isArray(value) && value.length > 0
      : typeof value === "string" && value.trim().length > 0;

    if (!hasAnswer) return false;
    if (needsSpecificText(value)) return (otherText[current.id] || "").trim().length > 0;
    return true;
  }, [step, team, current, answers, otherText]);

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
    if (!canContinue) return;
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
          <div className="topbar"><div className="brand">{headerTitle}</div></div>
          <div className="success">
            <div>
              <div className="successIcon">✓</div>
              <h1 className="title" style={{ fontSize: "3rem" }}>Thank you for the submission.</h1>
              <p className="subtitle successMessage">
                If you need help with anything, please feel free to email or speak with your line manager, and we will work on the appropriate level of support.
                <br /><br />
                It is important to us that you have everything you need to be successful.
                <br /><br />
                <strong>~ Campus Leadership</strong>
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="card">
        <div className="topbar"><div className="brand">{headerTitle}</div></div>
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
                    <strong>{t}</strong>
                    <span>{t === "Academic" ? "Teaching, learning and student-facing academic teams" : "Campus, service and operational teams"}</span>
                  </button>
                ))}
              </div>
            </>
          ) : current ? (
            <>
              <div className="eyebrow">Question {step + 1} of {questions.length}</div>
              <h1 className="title questionTitle">{current.title}</h1>
              {current.note && <p className="subtitle instruction">{current.note}</p>}

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

              {needsSpecificText(answers[current.id]) && (
                <div className="specificWrap">
                  <input
                    className="other"
                    placeholder="Please specify…"
                    value={otherText[current.id] || ""}
                    onChange={(e) => setOtherText((p) => ({ ...p, [current.id]: e.target.value }))}
                    aria-required="true"
                  />
                  {(otherText[current.id] || "").trim().length === 0 && (
                    <div className="requiredHint">Please enter a response before continuing.</div>
                  )}
                </div>
              )}
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
