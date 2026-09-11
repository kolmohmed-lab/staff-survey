export type WellbeingRecord = {
  submissionId: string;
  submittedAt: string;
  surveyMonth: string;
  year: number;
  language: string;
  team: string;
  schoolDivision: string;
  department: string;
  monthAhead: string;
  lookingForward: string;
  notLookingForward: string;
  focusAreas: string;
  leadershipFeeling: string;
  monthAheadDetail: string;
  lookingForwardDetail: string;
  notLookingForwardDetail: string;
  focusDetail: string;
  leadershipDetail: string;
};

export type WellbeingFilters = Partial<Pick<WellbeingRecord, "surveyMonth" | "year" | "language" | "team" | "schoolDivision" | "department">>;

const splitMulti = (value = "") => value.split(";").map((v) => v.trim()).filter(Boolean);

function countValues(values: string[]) {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  const total = values.filter(Boolean).length || 1;
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count, percentage: Math.round((count / total) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count);
}

function countMulti(values: string[]) {
  return countValues(values.flatMap(splitMulti));
}

function matches(record: WellbeingRecord, filters: WellbeingFilters) {
  return Object.entries(filters).every(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "All") return true;
    return String(record[key as keyof WellbeingRecord] ?? "") === String(value);
  });
}

function pct(count: number, total: number) {
  return total ? Math.round((count / total) * 1000) / 10 : 0;
}

function countWhere(records: WellbeingRecord[], test: (record: WellbeingRecord) => boolean) {
  return records.reduce((sum, record) => sum + (test(record) ? 1 : 0), 0);
}

function monthKey(record: WellbeingRecord) {
  const date = new Date(record.submittedAt);
  if (!Number.isNaN(date.getTime())) return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  return `${record.year}-${record.surveyMonth}`;
}

export async function fetchWellbeingRecords(): Promise<WellbeingRecord[]> {
  const url = process.env.POWER_AUTOMATE_READ_URL;
  const secret = process.env.POWER_AUTOMATE_READ_SECRET;
  if (!url || !secret) throw new Error("Wellbeing read flow is not configured.");

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-portal-secret": secret },
    body: JSON.stringify({ action: "readWellbeingResponses" }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Wellbeing flow returned ${response.status}`);
  const payload = await response.json();
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];

  return rows.map((row: Record<string, unknown>) => ({
    submissionId: String(row.submissionId ?? row.SubmissionID ?? row.SubmissionId ?? ""),
    submittedAt: String(row.submittedAt ?? row.SubmittedAt ?? ""),
    surveyMonth: String(row.surveyMonth ?? row.SurveyMonth ?? ""),
    year: Number(row.year ?? row.Year ?? 0),
    language: String(row.language ?? row.Language ?? ""),
    team: String(row.team ?? row.Team ?? ""),
    schoolDivision: String(row.schoolDivision ?? row.SchoolDivision ?? ""),
    department: String(row.department ?? row.Department ?? ""),
    monthAhead: String(row.monthAhead ?? row.MonthAhead ?? ""),
    lookingForward: String(row.lookingForward ?? row.LookingForwardTo ?? ""),
    notLookingForward: String(row.notLookingForward ?? row.NotLookingForwardTo ?? ""),
    focusAreas: String(row.focusAreas ?? row.FocusAreas ?? ""),
    leadershipFeeling: String(row.leadershipFeeling ?? row.LeadershipFeeling ?? ""),
    monthAheadDetail: String(row.monthAheadDetail ?? row.MonthAheadDetail ?? ""),
    lookingForwardDetail: String(row.lookingForwardDetail ?? row.LookingForwardDetail ?? ""),
    notLookingForwardDetail: String(row.notLookingForwardDetail ?? row.NotLookingForwardDetail ?? ""),
    focusDetail: String(row.focusDetail ?? row.FocusDetail ?? ""),
    leadershipDetail: String(row.leadershipDetail ?? row.LeadershipDetail ?? ""),
  }));
}

export function buildWellbeingDashboard(allRecords: WellbeingRecord[], filters: WellbeingFilters = {}) {
  const records = allRecords.filter((record) => matches(record, filters));
  const total = records.length;

  const concernLabels = {
    overwhelmed: "I am overwhelmed and could use some additional support",
    academicProfessionalStress: "I am currently experiencing a lot of professional stress at school",
    operationsProfessionalStress: "I am currently experiencing a lot of professional work-related stress",
  };

  const attention = {
    overwhelmed: pct(countWhere(records, (r) => r.monthAhead === concernLabels.overwhelmed), total),
    professionalStress: pct(countWhere(records, (r) => [concernLabels.academicProfessionalStress, concernLabels.operationsProfessionalStress].includes(r.monthAhead)), total),
    burdened: pct(countWhere(records, (r) => r.leadershipFeeling === "Burdened"), total),
    neglected: pct(countWhere(records, (r) => r.leadershipFeeling === "Neglected"), total),
    alienated: pct(countWhere(records, (r) => r.leadershipFeeling === "Alienated"), total),
    microManaged: pct(countWhere(records, (r) => r.leadershipFeeling === "Micro-Managed"), total),
    supported: pct(countWhere(records, (r) => r.leadershipFeeling === "Supported"), total),
    empowered: pct(countWhere(records, (r) => r.leadershipFeeling === "Empowered"), total),
    reassured: pct(countWhere(records, (r) => r.leadershipFeeling === "Reassured"), total),
  };

  const trendMap = new Map<string, WellbeingRecord[]>();
  records.forEach((record) => {
    const key = monthKey(record);
    trendMap.set(key, [...(trendMap.get(key) || []), record]);
  });

  const trends = [...trendMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, rows]) => ({
    month,
    responseCount: rows.length,
    overwhelmed: pct(countWhere(rows, (r) => r.monthAhead === concernLabels.overwhelmed), rows.length),
    professionalStress: pct(countWhere(rows, (r) => [concernLabels.academicProfessionalStress, concernLabels.operationsProfessionalStress].includes(r.monthAhead)), rows.length),
    supported: pct(countWhere(rows, (r) => r.leadershipFeeling === "Supported"), rows.length),
    empowered: pct(countWhere(rows, (r) => r.leadershipFeeling === "Empowered"), rows.length),
    burdened: pct(countWhere(rows, (r) => r.leadershipFeeling === "Burdened"), rows.length),
    microManaged: pct(countWhere(rows, (r) => r.leadershipFeeling === "Micro-Managed"), rows.length),
  }));

  const comments = records.flatMap((r) => ([
    ["Month Ahead", r.monthAheadDetail],
    ["Looking Forward To", r.lookingForwardDetail],
    ["Not Looking Forward To", r.notLookingForwardDetail],
    ["Focus Areas", r.focusDetail],
    ["Leadership Feeling", r.leadershipDetail],
  ] as const).filter(([, text]) => text.trim()).map(([question, text]) => ({ question, text, month: r.surveyMonth, team: r.team, schoolDivision: r.schoolDivision, department: r.department })));

  const dimensions = {
    months: [...new Set(allRecords.map((r) => r.surveyMonth).filter(Boolean))],
    years: [...new Set(allRecords.map((r) => r.year).filter(Boolean))].sort((a, b) => b - a),
    teams: [...new Set(allRecords.map((r) => r.team).filter(Boolean))],
    divisions: [...new Set(allRecords.map((r) => r.schoolDivision).filter(Boolean))],
    departments: [...new Set(allRecords.map((r) => r.department).filter(Boolean))],
    languages: [...new Set(allRecords.map((r) => r.language).filter(Boolean))],
  };

  return {
    summary: {
      total,
      academic: countWhere(records, (r) => r.team === "Academic"),
      operations: countWhere(records, (r) => r.team === "Operations"),
      english: countWhere(records, (r) => r.language === "English"),
      chinese: countWhere(records, (r) => r.language === "Chinese"),
      surveyMonth: filters.surveyMonth || records[0]?.surveyMonth || "—",
    },
    monthAhead: countValues(records.map((r) => r.monthAhead)),
    leadership: countValues(records.map((r) => r.leadershipFeeling)),
    focusAreas: countMulti(records.map((r) => r.focusAreas)),
    lookingForward: countMulti(records.map((r) => r.lookingForward)),
    notLookingForward: countMulti(records.map((r) => r.notLookingForward)),
    attention,
    comments,
    trends,
    dimensions,
  };
}
