"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  ["Overview", "/admin"],
  ["Staff Wellbeing", "/admin/wellbeing"],
  ["Learning Walks", "/admin/learning-walks"],
  ["MAP Data", "/admin/map"],
  ["Operations", "/admin/operations"],
  ["Cover Data", "/admin/cover"],
  ["Settings", "/admin/settings"],
] as const;

export default function AdminShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="adminRoot">
      <aside className="adminSidebar">
        <div>
          <div className="adminBrandMark">DAIS</div>
          <div className="adminBrandTitle">Management Portal</div>
          <div className="adminBrandMeta">Internal management data</div>
        </div>
        <nav className="adminNav" aria-label="Management sections">
          {navItems.map(([label, href]) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            const disabled = !["/admin", "/admin/wellbeing"].includes(href);
            return disabled ? (
              <span className="adminNavItem adminNavDisabled" key={href}>{label}<small>Later</small></span>
            ) : (
              <Link className={`adminNavItem ${active ? "active" : ""}`} href={href} key={href}>{label}</Link>
            );
          })}
        </nav>
        <button className="adminLogout" onClick={logout}>Log out</button>
      </aside>
      <main className="adminMain">
        <header className="adminHeader">
          <div>
            <p className="adminEyebrow">Management Dashboard</p>
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <div className="adminPrivacyBadge">Private · Management only</div>
        </header>
        {children}
      </main>
    </div>
  );
}
