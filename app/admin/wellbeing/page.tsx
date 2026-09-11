"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "../_components/AdminShell";

type Distribution = { label: string; count: number; percentage: number }[];
type Dashboard = {
  summary: { total: number; academic: number; operations: number; english: number; chinese: number; surveyMonth: string };
  monthAhead: Distribution;
  leadership: Distribution;
  focusAreas: Distribution;
  lookingForward: Distribution;
  notLookingForward: Distribution;
  attention: Record<string, number>;
  comments: { question: string; text: string; month: string; team: string; schoolDivision: string; department: string }[];
  trends: { month: string; responseCount: number; overwhelmed: number; professionalStress: number; supported: number; empowered: number; burdened: number; microManaged: number }[];
  dimensions: { months: string[]; years: number[]; teams: string[]; divisions: string[]; departments: string[]; languages: string[] };
};

const emptyDashboard: Dashboard = {
  summary: { total: 0, academic: 0, operations: 0, english: 0, chinese: 0, surveyMonth: "—" },
  monthAhead: [], leadership: [], focusAreas: [], lookingForward: [], notLookingForward: [], attention: {}, comments: [], trends: [],
  dimensions: { months: [], years: [], teams: [], divisions: [], departments: [], languages: [] },
};

function DistributionChart({ data }: { data: Distribution }) {
  if (!data.length) return <div className="emptyState">No responses match these filters.</div>;
  return <div className="barList">{data.map((item) => <div className="barRow" key={item.label}>
    <div className="barLabel">{item.label}</div>
    <div className="barTrack"><div className="barFill" style={{ width: `${Math.max(item.percentage, 2)}%` }} /></div>
    <div className="barValue">{item.count} · {item.percentage}%</div>
  </div>)}</div>;
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: (string | number)[]; onChange: (value: string) => void }) {
  return <label className="adminFilter">{label}<select value={value} onChange={(e) => onChange(e.target.value)}><option value="">All</option>{options.map((option) => <option key={String(option)} value={String(option)}>{option}</option>)}</select></label>;
}

export default function WellbeingPage() {
  const [dashboard, setDashboard] = useState<Dashboard>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ month: "", year: "", team: "", division: "", department: "", language: "" });

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
    return params.toString();
  }, [filters]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/admin/wellbeing${query ? `?${query}` : ""}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "Your session has expired." : "Unable to load wellbeing data.");
        return res.json();
      })
      .then((data) => { if (active) { setDashboard(data); setError(""); } })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query]);

  const setFilter = (key: keyof typeof filters) => (value: string) => setFilters((prev) => ({ ...prev, [key]: value }));
  const a = dashboard.attention;

  return (
    <AdminShell title="Staff Wellbeing Survey" subtitle="Anonymous response patterns and management indicators. The dashboard summarizes selections; it does not identify respondents or make diagnoses.">
      <section className="adminPanel" style={{ marginBottom: 16 }}>
        <div className="adminFilters">
          <Filter label="Month" value={filters.month} options={dashboard.dimensions.months} onChange={setFilter("month")} />
          <Filter label="Year" value={filters.year} options={dashboard.dimensions.years} onChange={setFilter("year")} />
          <Filter label="Team" value={filters.team} options={dashboard.dimensions.teams} onChange={setFilter("team")} />
          <Filter label="School Division" value={filters.division} options={dashboard.dimensions.divisions} onChange={setFilter("division")} />
          <Filter label="Department" value={filters.department} options={dashboard.dimensions.departments} onChange={setFilter("department")} />
          <Filter label="Language" value={filters.language} options={dashboard.dimensions.languages} onChange={setFilter("language")} />
        </div>
        {error ? <div className="adminLoginError">{error}</div> : null}
      </section>

      <section className="adminCards">
        {[
          ["Total responses", dashboard.summary.total], ["Academic", dashboard.summary.academic], ["Operations", dashboard.summary.operations],
          ["English", dashboard.summary.english], ["Chinese", dashboard.summary.chinese], ["Survey month", dashboard.summary.surveyMonth],
          ["Support needed", `${a.overwhelmed ?? 0}%`], ["Supported", `${a.supported ?? 0}%`],
        ].map(([label, value]) => <div className="adminStat" key={String(label)}><div className="adminStatLabel">{label}</div><div className="adminStatValue">{loading ? "…" : value}</div></div>)}
      </section>

      <section className="adminGrid2">
        <div className="adminPanel"><h2>Month Ahead</h2><p className="adminPanelSub">Distribution of the response selected for the coming month.</p><DistributionChart data={dashboard.monthAhead} /></div>
        <div className="adminPanel"><h2>Leadership Feeling</h2><p className="adminPanelSub">How staff described their feeling in relation to leadership.</p><DistributionChart data={dashboard.leadership} /></div>
      </section>

      <section className="adminPanel" style={{ marginBottom: 16 }}>
        <h2>Management Attention</h2><p className="adminPanelSub">Selected indicators shown neutrally as percentages of filtered responses.</p>
        <div className="attentionGrid">
          {[["Overwhelmed / support needed", a.overwhelmed], ["Professional stress", a.professionalStress], ["Burdened", a.burdened], ["Neglected", a.neglected], ["Alienated", a.alienated], ["Micro-managed", a.microManaged]].map(([label, value]) => <div className="attentionCard concern" key={String(label)}><strong>{value ?? 0}%</strong><span>{label}</span></div>)}
          {[["Supported", a.supported], ["Empowered", a.empowered], ["Reassured", a.reassured]].map(([label, value]) => <div className="attentionCard positive" key={String(label)}><strong>{value ?? 0}%</strong><span>{label}</span></div>)}
        </div>
      </section>

      <section className="adminGrid3">
        <div className="adminPanel"><h2>Top Focus Areas</h2><p className="adminPanelSub">Multi-select choices ranked by frequency.</p><DistributionChart data={dashboard.focusAreas} /></div>
        <div className="adminPanel"><h2>Looking Forward To</h2><p className="adminPanelSub">Most frequently selected positive items.</p><DistributionChart data={dashboard.lookingForward} /></div>
        <div className="adminPanel"><h2>Not Looking Forward To</h2><p className="adminPanelSub">Most frequently selected concerns.</p><DistributionChart data={dashboard.notLookingForward} /></div>
      </section>

      <section className="adminGrid2">
        <div className="adminPanel"><h2>Written Comments</h2><p className="adminPanelSub">Anonymous “More Specifically” responses grouped by their original question.</p><div className="commentList">{dashboard.comments.length ? dashboard.comments.map((comment, index) => <article className="commentItem" key={`${comment.question}-${index}`}><div className="commentQuestion">{comment.question}</div><div className="commentText">{comment.text}</div><div className="commentMeta">{[comment.month, comment.team, comment.schoolDivision, comment.department].filter(Boolean).join(" · ")}</div></article>) : <div className="emptyState">No written comments match these filters.</div>}</div></div>
        <div className="adminPanel"><h2>Monthly Trends</h2><p className="adminPanelSub">Response volume and selected indicators by month.</p><div style={{ overflowX: "auto" }}><table className="trendTable"><thead><tr><th>Month</th><th>Responses</th><th>Overwhelmed</th><th>Prof. stress</th><th>Supported</th><th>Empowered</th><th>Burdened</th><th>Micro-managed</th></tr></thead><tbody>{dashboard.trends.map((row) => <tr key={row.month}><td>{row.month}</td><td>{row.responseCount}</td><td>{row.overwhelmed}%</td><td>{row.professionalStress}%</td><td>{row.supported}%</td><td>{row.empowered}%</td><td>{row.burdened}%</td><td>{row.microManaged}%</td></tr>)}</tbody></table>{!dashboard.trends.length ? <div className="emptyState">Trend data will appear as monthly responses accumulate.</div> : null}</div></div>
      </section>
    </AdminShell>
  );
}
