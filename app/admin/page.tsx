import Link from "next/link";
import AdminShell from "./_components/AdminShell";

export default function AdminOverviewPage() {
  return (
    <AdminShell title="Overview" subtitle="One protected workspace for school management reporting.">
      <section className="overviewModules">
        <Link href="/admin/wellbeing" className="adminPanel moduleCard">
          <strong>Staff Wellbeing Survey</strong>
          <span>Anonymous staff wellbeing responses, trends, leadership feeling, focus areas and written comments.</span>
          <span className="moduleTag">Available now</span>
        </Link>
        {[
          ["Learning Walks", "Classroom observation and learning-walk reporting."],
          ["MAP Data", "Assessment trends, cohorts and benchmark reporting."],
          ["Operations", "Operations and support-team management data."],
          ["Cover Data", "Cover allocation, history and staffing patterns."],
          ["Other Reports", "Future management modules can be added without changing the portal shell."],
        ].map(([name, description]) => (
          <div className="adminPanel moduleCard" key={name}>
            <strong>{name}</strong><span>{description}</span><span className="moduleTag">Planned</span>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
