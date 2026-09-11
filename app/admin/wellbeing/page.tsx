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

type Tab = "overview" | "focus" | "comments" | "trends";

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
  const [tab, setTab] = useState<Tab>("overview");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
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
  const tabs: [Tab, string][] = [["overview", "Overview"], ["focus", "Focus Areas"], ["comments", `Comments${dashboard.comments.length ? ` (${dashboard.comments.length})` : ""}`], ["trends", "Trends"]];

  return (
    <AdminShell title="Staff Wellbeing Survey" subtitle="A concise management view of anonymous staff responses.">
      <section className="adminPanel" style={{ marginBottom: 16 }}>
        <div className="adminFilters" style={{ gridTemplateColumns: "repeat(4,minmax(130px,1fr))", marginBottom: showMoreFilters ? 10 : 0 }}>
          <Filter label="Month" value={filters.month} options={dashboard.dimensions.months} onChange={setFilter("month")} />
          <Filter label="Team" value={filters.team} options={dashboard.dimensions.teams} onChange={setFilter("team")} />
          <Filter label="School Division" value={filters.division} options={dashboard.dimensions.divisions} onChange={setFilter("division")} />
          <Filter label="Department" value={filters.department} options={dashboard.dimensions.departments} onChange={setFilter("department")} />
        </div>
        {showMoreFilters ? <div className="adminFilters" style={{ gridTemplateColumns: "repeat(2,minmax(130px,220px))", marginBottom: 8 }}>
          <Filter label="Year" value={filters.year} options={dashboard.dimensions.years} onChange={setFilter("year")} />
          <Filter label="Language" value={filters.language} options={dashboard.dimensions.languages} onChange={setFilter("language")} />
        </div> : null}
        <button className="btn ghost" style={{ padding: "8px 12px", fontSize: ".78rem", marginTop: 10 }} onClick={() => setShowMoreFilters((value) => !value)}>{showMoreFilters ? "Fewer filters" : "More filters"}</button>
        {error ? <div className="adminLoginError">{error}</div> : null}
      </section>

      <section className="adminCards" style={{ gridTemplateColumns: "repeat(5,minmax(0,1fr))" }}>
        {[["Responses", dashboard.summary.total], ["Academic", dashboard.summary.academic], ["Operations", dashboard.summary.operations], ["Support needed", `${a.overwhelmed ?? 0}%`], ["Supported", `${a.supported ?? 0}%`]].map(([label, value]) => <div className="adminStat" key={String(label)}><div className="adminStatLabel">{label}</div><div className="adminStatValue">{loading ? "…" : value}</div></div>)}
      </section>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "4px 0 16px" }}>
        {tabs.map(([key, label]) => <button key={key} onClick={() => setTab(key)} style={{ border: "1px solid rgba(17,55,89,.1)", borderRadius: 999, padding: "9px 14px", background: tab === key ? "#173654" : "rgba(255,255,255,.72)", color: tab === key ? "white" : "#173654", fontWeight: 700 }}>{label}</button>)}
      </div>

      {tab === "overview" ? <>
        <section className="adminGrid2">
          <div className="adminPanel"><h2>Month Ahead</h2><p className="adminPanelSub">How staff described the month ahead.</p><DistributionChart data={dashboard.monthAhead} /></div>
          <div className="adminPanel"><h2>Leadership Feeling</h2><p className="adminPanelSub">How staff described their feeling in relation to leadership.</p><DistributionChart data={dashboard.leadership} /></div>
        </section>
        <section className="adminPanel" style={{ marginBottom: 16 }}>
          <h2>Management Attention</h2><p className="adminPanelSub">Selected indicators shown neutrally as percentages of filtered responses.</p>
          <div className="attentionGrid">
            {[["Overwhelmed / support needed", a.overwhelmed], ["Professional stress", a.professionalStress], ["Burdened", a.burdened], ["Micro-managed", a.microManaged], ["Supported", a.supported], ["Empowered", a.empowered]].map(([label, value], index) => <div className={`attentionCard ${index < 4 ? "concern" : "positive"}`} key={String(label)}><strong>{value ?? 0}%</strong><span>{label}</span></div>)}
          </div>
        </section>
      </> : null}

      {tab === "focus" ? <section className="adminGrid3">
        <div className="adminPanel"><h2>Top Focus Areas</h2><p className="adminPanelSub">Multi-select choices ranked by frequency.</p><DistributionChart data={dashboard.focusAreas} /></div>
        <div className="adminPanel"><h2>Looking Forward To</h2><p className="adminPanelSub">Most frequently selected positive items.</p><DistributionChart data={dashboard.lookingForward} /></div>
        <div className="adminPanel"><h2>Not Looking Forward To</h2><p className="adminPanelSub">Most frequently selected concerns.</p><DistributionChart data={dashboard.notLookingForward} /></div>
      </section> : null}

      {tab === "comments" ? <section className="adminPanel">
        <h2>Written Comments</h2><p className="adminPanelSub">Anonymous “More Specifically” responses. No respondent identity is shown.</p>
        <div className="commentList">{dashboard.comments.length ? dashboard.comments.map((comment, index) => <article className="commentItem" key={`${comment.question}-${index}`}><div className="commentQuestion">{comment.question}</div><div className="commentText">{comment.text}</div><div className="commentMeta">{[comment.month, comment.team, comment.schoolDivision, comment.department].filter(Boolean).join(" · ")}</div></article>) : <div className="emptyState">No written comments match these filters.</div>}</div>
      </section> : null}

      {tab === "trends" ? <section className="adminPanel">
        <h2>Monthly Trends</h2><p className="adminPanelSub">Response volume and selected indicators by month.</p>
        <div style={{ overflowX: "auto" }}><table className="trendTable"><thead><tr><th>Month</th><th>Responses</th><th>Overwhelmed</th><th>Prof. stress</th><th>Supported</th><th>Empowered</th><th>Burdened</th><th>Micro-managed</th></tr></thead><tbody>{dashboard.trends.map((row) => <tr key={row.month}><td>{row.month}</td><td>{row.responseCount}</td><td>{row.overwhelmed}%</td><td>{row.professionalStress}%</td><td>{row.supported}%</td><td>{row.empowered}%</td><td>{row.burdened}%</td><td>{row.microManaged}%</td></tr>)}</tbody></table>{!dashboard.trends.length ? <div className="emptyState">Trend data will appear as monthly responses accumulate.</div> : null}</div>
      </section> : null}
    </AdminShell>
  );
}
