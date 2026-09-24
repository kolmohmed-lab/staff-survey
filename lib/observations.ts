export type ObservationRecord = {
  id: string;
  teacher: string;
  department: string;
  grade: string;
  course: string;
  observer: string;
  observationDate: string;
  status: string;
  submittedAt: string;
  facultySummary: string;
  learningSummary: string;
  attainmentSummary: string;
  progressSummary: string;
  finalOverall: string;
  facultyNotes: string;
  learningNotes: string;
  strengths: string;
  improvement: string;
  nextSteps: string;
  teacherSelfFaculty: string;
  teacherSelfLearning: string;
  teacherSelfAttainment: string;
  teacherSelfProgress: string;
  teacherSelfOverall: string;
  teacherSelfComments: string;
  teacherSelfCompleted: boolean;
  teacherSelfCompletedAt: string;
  facultyCriteria: { key: string; label: string; rating: string; notes: string }[];
  learningCriteria: { key: string; label: string; rating: string; notes: string }[];
};

const faculty = [
  ["subjectKnowledge","Subject knowledge / knowledge of how students learn"],
  ["lessonPlanning","Lesson planning"],
  ["timeResources","Use of time and resources"],
  ["learningEnvironment","Learning environment"],
  ["interactions","Teacher interactions, questioning and dialogue"],
  ["criticalThinking","Critical thinking, problem-solving and independent learning"],
  ["expectations","High scaffolded expectations"],
  ["assessmentAdaptation","Use of assessment information to adapt teaching"],
  ["challengeGroups","Appropriate challenge for different groups"]
] as const;

const learning = [
  ["responsibility","Students take responsibility for learning"],
  ["writtenFeedback","Students receive and engage with written feedback"],
  ["strengthsWeaknesses","Students know strengths and weaknesses"],
  ["peerAssessment","Self and peer assessment"],
  ["collaboration","Interaction, collaboration and communication"],
  ["connections","Connections to other learning / real world"],
  ["innovationResearch","Innovation, enquiry and research"],
  ["technology","Purposeful use of resources and technology"],
  ["studentCriticalThinking","Student critical thinking and problem solving"]
] as const;

function value(row: any, ...keys: string[]) {
  for (const key of keys) {
    const v = row?.[key];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return "";
}
function text(row:any,...keys:string[]){ return String(value(row,...keys) ?? ""); }
function bool(row:any,...keys:string[]){
  const v=value(row,...keys);
  return v===true || v===1 || String(v).toLowerCase()==="true" || String(v).toLowerCase()==="yes";
}

export function normalizeObservation(row:any): ObservationRecord {
  const criteria = (prefix:string, defs: readonly (readonly [string,string])[]) =>
    defs.map(([key,label]) => ({
      key,
      label,
      rating: text(row, `${prefix}_${key}`, `${prefix}_${key}_x0020_`, `${prefix}${key}`),
      notes: text(row, `${prefix}_${key}_notes`, `${prefix}${key}Notes`)
    }));

  return {
    id: text(row,"observationID","ObservationID","Observation_x0020_ID","Title","ID"),
    teacher: text(row,"teacher","Teacher"),
    department: text(row,"department","Department"),
    grade: text(row,"grade","Grade"),
    course: text(row,"course","Course"),
    observer: text(row,"observer","Observer"),
    observationDate: text(row,"observationDate","ObservationDate","Observation_x0020_Date"),
    status: text(row,"status","Status"),
    submittedAt: text(row,"submittedAt","SubmittedAt","Submitted_x0020_At","Created"),
    facultySummary: text(row,"facultySummary","FacultySummary","Faculty_x0020_Summary"),
    learningSummary: text(row,"learningSummary","LearningSummary","Learning_x0020_Summary"),
    attainmentSummary: text(row,"attainmentSummary","AttainmentSummary","Attainment_x0020_Summary"),
    progressSummary: text(row,"progressSummary","ProgressSummary","Progress_x0020_Summary"),
    finalOverall: text(row,"finalOverall","FinalOverall","Final_x0020_Overall","Overall"),
    facultyNotes: text(row,"facultyNotes","FacultyNotes","Faculty_x0020_Notes"),
    learningNotes: text(row,"learningNotes","LearningNotes","Learning_x0020_Notes"),
    strengths: text(row,"strengths","Strengths"),
    improvement: text(row,"improvement","Improvement","ItemsForImprovement"),
    nextSteps: text(row,"nextSteps","NextSteps","Next_x0020_Steps"),
    teacherSelfFaculty: text(row,"teacherSelfFaculty","TeacherSelfFaculty"),
    teacherSelfLearning: text(row,"teacherSelfLearning","TeacherSelfLearning"),
    teacherSelfAttainment: text(row,"teacherSelfAttainment","TeacherSelfAttainment"),
    teacherSelfProgress: text(row,"teacherSelfProgress","TeacherSelfProgress"),
    teacherSelfOverall: text(row,"teacherSelfOverall","TeacherSelfOverall"),
    teacherSelfComments: text(row,"teacherSelfComments","TeacherSelfComments"),
    teacherSelfCompleted: bool(row,"teacherSelfCompleted","TeacherSelfCompleted"),
    teacherSelfCompletedAt: text(row,"teacherSelfCompletedAt","TeacherSelfCompletedAt"),
    facultyCriteria: criteria("faculty", faculty),
    learningCriteria: criteria("learning", learning),
  };
}

export async function fetchObservationRecords(): Promise<ObservationRecord[]> {
  const url = process.env.OBSERVATION_POWER_AUTOMATE_READ_URL;
  if (!url) throw new Error("OBSERVATION_POWER_AUTOMATE_READ_URL is not configured");

  const headers: Record<string,string> = { Accept: "application/json" };
  if (process.env.OBSERVATION_POWER_AUTOMATE_READ_SECRET) {
    headers["x-observation-secret"] = process.env.OBSERVATION_POWER_AUTOMATE_READ_SECRET;
  }

  const response = await fetch(url, { method: "GET", headers, cache: "no-store" });
  if (!response.ok) throw new Error(`Observation read flow returned ${response.status}`);
  const raw = await response.json();
  const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.value) ? raw.value : Array.isArray(raw?.body?.value) ? raw.body.value : [];
  return rows.map(normalizeObservation).sort((a,b) =>
    String(b.observationDate || b.submittedAt).localeCompare(String(a.observationDate || a.submittedAt))
  );
}
