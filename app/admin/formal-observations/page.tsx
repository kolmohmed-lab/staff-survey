"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "../_components/AdminShell";

type Criterion = { key: string; label: string; rating: string; notes: string };
type Observation = {
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
  facultyCriteria: Criterion[];
  learningCriteria: Criterion[];
};

function Rating({ value }: { value: string }) {
  const label = value || "Not rated";
  const cls = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return <span className={`formalRating formalRating-${cls}`}>{label}</span>;
}

function Meta({ label, value }: { label: string; value?: string }) {
  return (
    <div className="formalMeta">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

function CriteriaBlock({
  title,
  items,
  notes,
}: {
  title: string;
  items: Criterion[];
  notes: string;
}) {
  return (
    <section className="formalSection">
      <h3>{title}</h3>
      <div className="formalCriteria">
        {items.map((item) => (
          <div className="formalCriterion" key={item.key}>
            <div>
              <strong>{item.label}</strong>
              {item.notes ? <p>{item.notes}</p> : null}
            </div>
            <Rating value={item.rating} />
          </div>
        ))}
      </div>
      {notes ? (
        <div className="formalTextBox">
          <strong>Additional notes</strong>
          <p>{notes}</p>
        </div>
      ) : null}
    </section>
  );
}

export default function FormalObservationsPage() {
  const [records, setRecords] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/admin/formal-observations", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load formal observations.");
        return response.json();
      })
      .then((data) => {
        setRecords(data.records || []);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const statuses = useMemo(
    () => Array.from(new Set(records.map((record) => record.status).filter(Boolean))).sort(),
    [records]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const searchable = [
        record.teacher,
        record.observer,
        record.department,
        record.course,
        record.grade,
        record.observationID,
      ]
        .join(" ")
        .toLowerCase();
      return (!query || searchable.includes(query)) && (!status || record.status === status);
    });
  }, [records, search, status]);

  return (
    <AdminShell
      title="Formal Observations"
      subtitle="All submitted formal lesson observations, with complete detail and print-ready records."
    >
      <section className="adminPanel formalToolbar noPrint">
        <label>
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Teacher, observer, course, ID…"
          />
        </label>

        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="formalCount">
          {loading ? "Loading…" : `${filtered.length} of ${records.length} observations`}
        </div>

        <button className="formalPrintButton" onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </section>

      {error ? <div className="adminLoginError noPrint">{error}</div> : null}
      {!loading && !filtered.length ? (
        <div className="adminPanel emptyState">No formal observations match these filters.</div>
      ) : null}

      <div className="formalPrintHeader">
        <strong>DAIS & DHS</strong>
        <span>Formal Lesson Observation Records</span>
      </div>

      <section className="formalRecords">
        {filtered.map((record, index) => (
          <article className="formalRecord" key={record.observationID || index}>
            <header className="formalRecordHeader">
              <div>
                <div className="formalKicker">Formal Lesson Observation</div>
                <h2>{record.teacher || "Teacher"}</h2>
                <p>{[record.department, record.grade, record.course].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="formalOverall">
                <span>Final overall</span>
                <Rating value={record.finalOverall} />
              </div>
            </header>

            <div className="formalMetaGrid">
              <Meta label="Observation ID" value={record.observationID} />
              <Meta label="Observer" value={record.observer} />
              <Meta label="Observation date" value={record.observationDate} />
              <Meta label="Status" value={record.status} />
              <Meta label="Submitted" value={record.submittedAt} />
            </div>

            <section className="formalSection">
              <h3>Evaluation summary</h3>
              <div className="formalSummaryGrid">
                <div><span>Faculty teaching</span><Rating value={record.facultySummary} /></div>
                <div><span>Student learning</span><Rating value={record.learningSummary} /></div>
                <div><span>Student attainment</span><Rating value={record.attainmentSummary} /></div>
                <div><span>Student progress</span><Rating value={record.progressSummary} /></div>
              </div>
            </section>

            <CriteriaBlock
              title="Faculty teaching skills"
              items={record.facultyCriteria}
              notes={record.facultyNotes}
            />

            <CriteriaBlock
              title="Student learning skills"
              items={record.learningCriteria}
              notes={record.learningNotes}
            />

            <section className="formalSection">
              <h3>Feedback & next steps</h3>
              <div className="formalFeedbackGrid">
                <div><strong>Main strengths</strong><p>{record.strengths || "—"}</p></div>
                <div><strong>Items for improvement</strong><p>{record.improvement || "—"}</p></div>
                <div><strong>Next steps</strong><p>{record.nextSteps || "—"}</p></div>
              </div>
            </section>

            <section className="formalSection">
              <h3>Teacher self-appraisal</h3>
              <div className="formalSummaryGrid">
                <div><span>Faculty teaching</span><Rating value={record.teacherSelfFaculty} /></div>
                <div><span>Student learning</span><Rating value={record.teacherSelfLearning} /></div>
                <div><span>Student attainment</span><Rating value={record.teacherSelfAttainment} /></div>
                <div><span>Student progress</span><Rating value={record.teacherSelfProgress} /></div>
              </div>
              <div className="formalSelfOverall">
                <span>Teacher overall</span>
                <Rating value={record.teacherSelfOverall} />
                <strong>{record.teacherSelfCompleted ? "Completed" : "Awaiting self-appraisal"}</strong>
              </div>
              {record.teacherSelfComments ? (
                <div className="formalTextBox">
                  <strong>Teacher comments</strong>
                  <p>{record.teacherSelfComments}</p>
                </div>
              ) : null}
            </section>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}
