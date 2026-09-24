export type ObservationRecord = {
  observationID: string;
  teacher: string;
  teacherEmail: string;
  observer: string;
  observationDate: string;
  department: string;
  grade: string;
  course: string;
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
  studentAttainment: string;
  studentProgress: string;
  status: string;
  submittedAt: string;
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

const facultyCriteria = [
  ["subjectKnowledge", "Subject knowledge and knowledge of how students learn"],
  ["lessonPlanning", "Lesson planning"],
  ["timeResources", "Use of time and resources"],
  ["learningEnvironment", "Learning environment"],
  ["interactions", "Interactions, questioning and dialogue"],
  ["criticalThinking", "Critical thinking, problem-solving and independent learning"],
  ["expectations", "High scaffolded expectations"],
  ["assessmentAdaptation", "Use of assessment information to adapt teaching"],
  ["challengeGroups", "Appropriate challenge for different groups"],
] as const;

const learningCriteria = [
  ["responsibility", "Students taking responsibility for their own learning"],
  ["writtenFeedback", "Written feedback"],
  ["strengthsWeaknesses", "Knowledge of strengths and weaknesses"],
  ["peerAssessment", "Self and peer assessment"],
  ["collaboration", "Interaction, collaboration and communication"],
  ["connections", "Connections to other learning / the real world"],
  ["innovationResearch", "Innovation, enquiry and research"],
  ["technology", "Purposeful use of resources and technology"],
  ["studentCriticalThinking", "Critical thinking and problem solving"],
] as const;

function first(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function asText(row: Record<string, unknown>, ...keys: string[]) {
  return String(first(row, ...keys) ?? "");
}

function asBool(row: Record<string, unknown>, ...keys: string[]) {
  const value = first(row, ...keys);
  return value === true || value === 1 || ["true", "yes", "1"].includes(String(value).toLowerCase());
}

export function normalizeObservation(input: Record<string, unknown>): ObservationRecord {
  const mapCriteria = (prefix: string, defs: readonly (readonly [string, string])[]) =>
    defs.map(([key, label]) => ({
      key,
      label,
      rating: asText(input, `${prefix}_${key}`, `${prefix}${key}`),
      notes: asText(input, `${prefix}_${key}_notes`, `${prefix}${key}Notes`),
    }));

  return {
    observationID: asText(input, "ObservationID", "observationID", "Title"),
    teacher: asText(input, "Teacher", "teacher"),
    teacherEmail: asText(input, "TeacherEmail", "teacherEmail"),
    observer: asText(input, "Observer", "observer"),
    observationDate: asText(input, "ObservationDate", "observationDate"),
    department: asText(input, "Department", "department"),
    grade: asText(input, "Grade", "grade"),
    course: asText(input, "Course", "course"),
    facultySummary: asText(input, "FacultySummary", "facultySummary"),
    learningSummary: asText(input, "LearningSummary", "learningSummary"),
    attainmentSummary: asText(input, "AttainmentSummary", "attainmentSummary"),
    progressSummary: asText(input, "ProgressSummary", "progressSummary"),
    finalOverall: asText(input, "FinalOverall", "finalOverall", "Overall"),
    facultyNotes: asText(input, "FacultyNotes", "facultyNotes"),
    learningNotes: asText(input, "LearningNotes", "learningNotes"),
    strengths: asText(input, "Strengths", "strengths"),
    improvement: asText(input, "Improvement", "improvement"),
    nextSteps: asText(input, "NextSteps", "nextSteps"),
    studentAttainment: asText(input, "StudentAttainment", "studentAttainment"),
    studentProgress: asText(input, "StudentProgress", "studentProgress"),
    status: asText(input, "Status", "status"),
    submittedAt: asText(input, "SubmittedAt", "submittedAt", "Created"),
    teacherSelfFaculty: asText(input, "TeacherSelfFaculty", "teacherSelfFaculty"),
    teacherSelfLearning: asText(input, "TeacherSelfLearning", "teacherSelfLearning"),
    teacherSelfAttainment: asText(input, "TeacherSelfAttainment", "teacherSelfAttainment"),
    teacherSelfProgress: asText(input, "TeacherSelfProgress", "teacherSelfProgress"),
    teacherSelfOverall: asText(input, "TeacherSelfOverall", "teacherSelfOverall"),
    teacherSelfComments: asText(input, "TeacherSelfComments", "teacherSelfComments"),
    teacherSelfCompleted: asBool(input, "TeacherSelfCompleted", "teacherSelfCompleted"),
    teacherSelfCompletedAt: asText(input, "TeacherSelfCompletedAt", "teacherSelfCompletedAt"),
    facultyCriteria: mapCriteria("faculty", facultyCriteria),
    learningCriteria: mapCriteria("learning", learningCriteria),
  };
}

export async function fetchObservationRecords(): Promise<ObservationRecord[]> {
  const url = process.env.OBSERVATION_POWER_AUTOMATE_READ_URL;
  if (!url) throw new Error("OBSERVATION_POWER_AUTOMATE_READ_URL is not configured");

  const headers: Record<string, string> = { Accept: "application/json" };
  if (process.env.OBSERVATION_POWER_AUTOMATE_READ_SECRET) {
    headers["x-observation-secret"] = process.env.OBSERVATION_POWER_AUTOMATE_READ_SECRET;
  }

  const response = await fetch(url, { method: "GET", headers, cache: "no-store" });
  if (!response.ok) throw new Error(`Observation read flow returned ${response.status}`);

  const raw = await response.json();
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.value)
      ? raw.value
      : Array.isArray(raw?.body?.value)
        ? raw.body.value
        : [];

  return rows
    .map((row: Record<string, unknown>) => normalizeObservation(row))
    .sort((a: ObservationRecord, b: ObservationRecord) =>
      String(b.observationDate || b.submittedAt).localeCompare(String(a.observationDate || a.submittedAt))
    );
}
