"use client";

import { useMemo, useState } from "react";

type Team = "Academic" | "Operations";
type Language = "English" | "Chinese";
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

const zhQuestionTitles: Record<string, string> = {
  schoolDivision: "您所在的学校/学部",
  department: "您所在的部门",
  monthAhead: "以下哪项最能描述您对未来一个月的感受：",
  lookingForward: "在未来一个月中，您最期待什么？",
  notLookingForward: "在未来一个月中，您最不期待什么？",
  focus: "在未来一个月中，您计划更多关注哪些方面？",
};

const zhOptions: Record<string, string> = {
  Heritage: "传承部",
  Bilingual: "双语部",
  "DAIS Elementary": "DAIS 小学部",
  "DAIS Secondary": "DAIS 中学部",
  Boarding: "寄宿部",
  "Early Years": "幼儿部",
  Elementary: "小学",
  "Middle School": "初中",
  "High School": "高中",
  Math: "数学",
  English: "英文",
  "Social Studies": "社会学科",
  Mandarin: "中文",
  Science: "科学",
  "PE / Athletics / ASA": "体育/竞技/课外活动",
  "Art / Design": "艺术/设计",
  "Performing Arts": "表演艺术",
  "Student Services": "学生服务",
  EAL: "英语语言支持（EAL）",
  "SLT+": "高级领导团队（SLT+）",
  "Office / Support Staff": "办公室/支持人员",
  HR: "人力资源",
  Finance: "财务",
  Facilities: "设施管理",
  Marketing: "市场",
  Admissions: "招生",
  "Campus Village": "公寓",
  Catering: "餐饮",
  IT: "信息技术（IT）",
  "I’m doing great, I am ready for it": "我状态很好，已经准备好了",
  "I have a lot of work coming up, but I’m pacing myself and will get it all done": "接下来工作很多，但我正在合理安排节奏，并有信心完成",
  "I am holding steady": "我目前状态稳定",
  "I am overwhelmed and could use some additional support": "我感到压力很大，希望得到一些额外支持",
  "I am currently experiencing a lot of personal stress in my life": "我目前在个人生活方面承受较大压力",
  "I am currently experiencing a lot of professional stress at school": "我目前在学校工作方面承受较大压力",
  "I am currently experiencing a lot of professional work-related stress": "我目前承受较大的工作相关压力",
  "More Specifically": "更具体地说",
  "Something academic in class": "课堂教学相关事项",
  "Something extracurricular": "课外活动",
  "A special event": "特别活动",
  "An athletic event": "体育活动",
  "Something personal": "个人方面的事情",
  "Something professional": "工作/专业方面的事情",
  "Student support": "学生支持",
  "Parent communication": "家长沟通",
  "Grading / Student Feedback": "评分/学生反馈",
  "Administrative Tasks": "行政事务",
  "Getting Organized": "提升组织与规划",
  "Personal Issues": "个人事务",
  "Professional Development": "专业发展",
  "Working on My Learning Environment": "改善我的学习环境",
  "Professional Relationships": "专业关系",
  Supported: "得到支持",
  Alienated: "被疏远",
  Neglected: "被忽视",
  "Micro-Managed": "被过度管理",
  Reassured: "感到安心",
  Burdened: "感到负担加重",
  Empowered: "获得赋能",
  Other: "其他",
  "Working with colleagues on my team": "与团队同事合作",
  "Completing a work task and/or project": "完成工作任务和/或项目",
  "Special school event": "学校特别活动",
  "School athletic event": "学校体育活动",
  "New initiative and/or change": "新的举措和/或变化",
  "Professional growth/development opportunity": "专业成长/发展机会",
  "Heavy workload and/or busy period": "工作量大和/或繁忙时期",
  "Project and/or task deadlines": "项目和/或任务截止日期",
  "Difficult Conversations": "困难的沟通或谈话",
  "New / Upcoming Changes": "新的/即将发生的变化",
  "Supporting colleagues": "支持同事",
  "Completing key priorities and tasks": "完成关键优先事项和任务",
  "Getting organized": "提升组织与规划",
  "Communicating with other departments": "与其他部门沟通",
  "Personal wellbeing": "个人身心健康",
  "Creating balance between competing priorities": "在多项优先事务之间取得平衡",
  "Working smarter and/or Improving Processes": "更高效地工作和/或改进流程",
};

function chineseOptionLabel(option: string, questionId: string, team: Team | null) {
  if (option === "Nothing") {
    return questionId === "lookingForward" ? "没有特别期待" : "没有特别不期待的事情";
  }
  if (option === "Nothing particular") {
    return questionId === "lookingForward" ? "没有特别期待" : "没有特别不期待的事情";
  }
  if (option === "Something professional" && team === "Operations" && questionId === "notLookingForward") {
    return "工作方面的事情";
  }
  return zhOptions[option] || option;
}

function needsSpecificText(value: string | string[] | undefined) {
  if (!value) return false;
  if (Array.isArray(value)) return value.some((v) => v.includes("More Specifically"));
  return value.includes("More Specifically") || value === "Other";
}

export default function Home() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const isZh = language === "Chinese";

  const questions = useMemo(() => {
    if (team === "Operations") return operationsQuestions;
    if (team === "Academic") {
      const needsDepartment = answers.schoolDivision === "DAIS Secondary";
      return needsDepartment ? academicQuestions : academicQuestions.filter((question) => question.id !== "department");
    }
    return [];
  }, [team, answers.schoolDivision]);

  const current = step >= 0 ? questions[step] : null;
  const progress = language && team && step >= 0 ? ((step + 1) / questions.length) * 100 : 0;
  const headerTitle = !team
    ? isZh ? "员工身心健康问卷" : "WELLBEING STAFF SURVEY"
    : isZh
      ? team === "Academic" ? "月度学术团队身心健康问卷" : "月度运营团队身心健康问卷"
      : `MONTHLY ${team.toUpperCase()} TEAM WELLBEING SURVEY`;

  const currentTitle = current
    ? isZh
      ? current.id === "leadershipFeeling"
        ? team === "Academic"
          ? "在过去一个月中，您觉得学部领导让您感到____________"
          : "在过去一个月中，领导团队让您感到____________"
        : zhQuestionTitles[current.id] || current.title
      : current.title
    : "";

  const currentNote = current
    ? isZh
      ? current.id === "schoolDivision" || current.id === "department"
        ? "（请选择最符合您所属部门的一项）"
        : current.id === "leadershipFeeling"
          ? "（请选择一项）"
          : current.type === "multi"
            ? "（可多选）"
            : ""
      : current.note
    : "";

  const canContinue = useMemo(() => {
    if (!language || !team || !current) return false;
    const value = answers[current.id];
    const hasAnswer = current.type === "multi"
      ? Array.isArray(value) && value.length > 0
      : typeof value === "string" && value.trim().length > 0;
    if (!hasAnswer) return false;
    if (needsSpecificText(value)) return (otherText[current.id] || "").trim().length > 0;
    return true;
  }, [language, team, current, answers, otherText]);

  function chooseSingle(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMulti(id: string, value: string) {
    setAnswers((prev) => {
      const existing = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      return { ...prev, [id]: existing.includes(value) ? existing.filter((v) => v !== value) : [...existing, value] };
    });
  }

  function chooseLanguage(value: Language) {
    setLanguage(value);
    setTeam(null);
    setStep(-1);
    setAnswers({});
    setOtherText({});
  }

  function chooseTeam(value: Team) {
    setTeam(value);
    setStep(0);
    setAnswers({});
    setOtherText({});
  }

  async function next() {
    if (!language || !team || !canContinue) return;
    if (step < questions.length - 1) return setStep((s) => s + 1);

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
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
      setError(isZh ? "提交失败，请重试。" : "We couldn’t submit your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function back() {
    setError("");
    if (!language) return;
    if (!team) {
      setLanguage(null);
      return;
    }
    if (step > 0) {
      setStep((s) => s - 1);
      return;
    }
    setTeam(null);
    setStep(-1);
    setAnswers({});
    setOtherText({});
  }

  if (done) {
    return (
      <main className="shell">
        <section className="card">
          <div className="topbar"><div className="brand">{headerTitle}</div></div>
          <div className="success">
            <div>
              <div className="successIcon">✓</div>
              <h1 className="title" style={{ fontSize: "3rem" }}>{isZh ? "感谢您的提交。" : "Thank you for the submission."}</h1>
              <p className="subtitle successMessage">
                {isZh ? <>
                  如果您在任何方面需要帮助，请随时通过电子邮件或当面与您的直属主管沟通，我们将共同确定适当的支持方式。
                  <br /><br />
                  我们非常重视确保您拥有取得成功所需要的一切支持。
                  <br /><br />
                  <strong>~ 校园领导团队</strong>
                </> : <>
                  If you need help with anything, please feel free to email or speak with your line manager, and we will work on the appropriate level of support.
                  <br /><br />
                  It is important to us that you have everything you need to be successful.
                  <br /><br />
                  <strong>~ Campus Leadership</strong>
                </>}
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
        {language && team && step >= 0 && <div className="progress"><div style={{ width: `${progress}%` }} /></div>}

        <div className="content">
          {!language ? (
            <>
              <div className="eyebrow">Language / 语言</div>
              <h1 className="title">Choose your language<br />请选择语言</h1>
              <p className="subtitle">Select the language you would like to use for the survey.<br />请选择您希望使用的调查语言。</p>
              <div className="grid">
                <button className="option" onClick={() => chooseLanguage("English")}><strong>English</strong></button>
                <button className="option" onClick={() => chooseLanguage("Chinese")}><strong>中文</strong></button>
              </div>
            </>
          ) : !team ? (
            <>
              <div className="eyebrow">{isZh ? "月度身心健康问卷" : "Monthly wellbeing survey"}</div>
              <h1 className="title">{isZh ? "请选择您的团队" : "How has this month been for you?"}</h1>
              <p className="subtitle">{isZh ? "本问卷完全匿名；您的登录信息不会被保存。请选择最符合您岗位的团队。" : "This survey is completely anonymous. Start by choosing the team that best describes your role."}</p>
              <div className="grid">
                <button className="option" onClick={() => chooseTeam("Academic")}>
                  <strong>{isZh ? "学术团队" : "Academic"}</strong>
                  <span>{isZh ? "教学、学习及面向学生的学术岗位" : "Teaching, learning and student-facing academic teams"}</span>
                </button>
                <button className="option" onClick={() => chooseTeam("Operations")}>
                  <strong>{isZh ? "运营团队" : "Operations"}</strong>
                  <span>{isZh ? "校园服务、支持及运营岗位" : "Campus, service and operational teams"}</span>
                </button>
              </div>
            </>
          ) : current ? (
            <>
              <div className="eyebrow">{isZh ? `第 ${step + 1} 题，共 ${questions.length} 题` : `Question ${step + 1} of ${questions.length}`}</div>
              <h1 className="title questionTitle">{currentTitle}</h1>
              {currentNote && <p className="subtitle instruction">{currentNote}</p>}

              <div className="choices">
                {current.options?.map((option) => {
                  const value = answers[current.id];
                  const selected = current.type === "multi" ? Array.isArray(value) && value.includes(option) : value === option;
                  return (
                    <button key={option} className={`option ${selected ? "selected" : ""}`} onClick={() => current.type === "multi" ? toggleMulti(current.id, option) : chooseSingle(current.id, option)}>
                      <strong>{isZh ? chineseOptionLabel(option, current.id, team) : option}</strong>
                    </button>
                  );
                })}
              </div>

              {needsSpecificText(answers[current.id]) && (
                <div className="specificWrap">
                  <input
                    className="other"
                    placeholder={isZh ? "更具体地说…" : "Please specify…"}
                    value={otherText[current.id] || ""}
                    onChange={(e) => setOtherText((p) => ({ ...p, [current.id]: e.target.value }))}
                    aria-required="true"
                  />
                  {(otherText[current.id] || "").trim().length === 0 && (
                    <div className="requiredHint">{isZh ? "请输入内容后再继续。" : "Please enter a response before continuing."}</div>
                  )}
                </div>
              )}
            </>
          ) : null}

          {error && <div className="error">{error}</div>}

          <div className="footer">
            <div>{language && <button className="btn ghost" onClick={back}>{isZh ? "← 返回" : "← Back"}</button>}</div>
            {language && team && current && (
              <button className="btn primary" disabled={!canContinue || submitting} onClick={next}>
                {submitting ? (isZh ? "正在提交…" : "Submitting…") : step === questions.length - 1 ? (isZh ? "提交问卷" : "Submit response") : (isZh ? "继续 →" : "Continue →")}
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
