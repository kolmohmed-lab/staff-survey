"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: data.get("username"), password: data.get("password") }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body?.error || "Unable to sign in.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="adminLoginWrap">
      <section className="adminLoginCard">
        <div className="adminBrandMark" style={{ color: "#173654", borderColor: "rgba(23,54,84,.16)" }}>DAIS</div>
        <h1>Management Portal</h1>
        <p>Authorized management access only. Sign in to view internal school data.</p>
        <form className="adminLoginForm" onSubmit={submit}>
          <label className="adminLoginField">Username<input name="username" autoComplete="username" required /></label>
          <label className="adminLoginField">Password<input name="password" type="password" autoComplete="current-password" required /></label>
          {error ? <div className="adminLoginError">{error}</div> : null}
          <button className="adminLoginButton" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </form>
      </section>
    </div>
  );
}
