import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resetAdminPasswordWithCode } from "@/lib/admin-setup.functions";

export const Route = createFileRoute("/admin/forgot")({
  head: () => ({
    meta: [
      { title: "Reset Admin Password — Wish Well" },
      { name: "description", content: "Request a password reset link for the Wish Well admin account." },
      { property: "og:title", content: "Reset Admin Password — Wish Well" },
      { property: "og:description", content: "Request a password reset link for the Wish Well admin account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [cErr, setCErr] = useState<string | null>(null);
  const [cBusy, setCBusy] = useState(false);
  const [cDone, setCDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return setErr(error.message);
    setSent(true);
  }

  async function onCodeReset(e: React.FormEvent) {
    e.preventDefault();
    setCErr(null);
    if (pw.length < 8) return setCErr("Password must be at least 8 characters.");
    if (pw !== pw2) return setCErr("Passwords do not match.");
    setCBusy(true);
    try {
      await resetAdminPasswordWithCode({
        data: { email: email.trim(), code: code.trim(), password: pw },
      });
      setCDone(true);
      setTimeout(() => navigate({ to: "/admin/login" }), 1200);
    } catch (e2) {
      setCErr(e2 instanceof Error ? e2.message : "Could not reset password.");
    } finally {
      setCBusy(false);
    }
  }

  return (
    <div style={wrap}>
      <div style={panel}>
        <h1 style={{ marginTop: 0 }}>Forgot password</h1>
        {sent ? (
          <p style={{ color: "#c7cfdd", lineHeight: 1.6 }}>
            If an account exists for <strong>{email}</strong>, a reset link is on its way. Open it on this
            device to set a new password.
          </p>
        ) : (
          <form onSubmit={onSubmit}>
            <label style={lbl}>Admin email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inp}
              autoComplete="username"
            />
            {err && <p style={{ color: "#ff9a9a" }}>{err}</p>}
            <button type="submit" disabled={busy} style={btn}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <hr style={{ margin: "26px 0 18px", border: 0, borderTop: "1px solid #2d3a52" }} />

        <h2 style={{ margin: "0 0 6px", fontSize: 16 }}>No email? Use your recovery code</h2>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: "#8a94a8", lineHeight: 1.6 }}>
          Enter the admin email above, then your recovery code and a new password.
        </p>
        {cDone ? (
          <p style={{ color: "#9fe3a5" }}>Password updated. Taking you to login…</p>
        ) : (
          <form onSubmit={onCodeReset}>
            <label style={lbl}>Recovery code</label>
            <input type="password" required value={code} onChange={(e) => setCode(e.target.value)} style={inp} autoComplete="one-time-code" />
            <label style={lbl}>New password</label>
            <input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} style={inp} autoComplete="new-password" />
            <label style={lbl}>Confirm new password</label>
            <input type="password" required value={pw2} onChange={(e) => setPw2(e.target.value)} style={inp} autoComplete="new-password" />
            {cErr && <p style={{ color: "#ff9a9a" }}>{cErr}</p>}
            <button type="submit" disabled={cBusy} style={btn}>
              {cBusy ? "Updating…" : "Reset password with code"}
            </button>
          </form>
        )}

        <p style={{ marginTop: 18, fontSize: 13, color: "#8a94a8" }}>
          <Link to="/admin/login" style={{ color: "#e94f4f" }}>Back to login</Link>
        </p>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = { minHeight: "100vh", background: "#111826", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "system-ui, sans-serif", color: "#eee" };
const panel: React.CSSProperties = { background: "#1c2536", padding: 32, borderRadius: 10, width: "100%", maxWidth: 420, boxShadow: "0 10px 40px rgba(0,0,0,.5)" };
const lbl: React.CSSProperties = { display: "block", margin: "12px 0 6px", fontSize: 14, color: "#c7cfdd" };
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", background: "#0f1420", border: "1px solid #2d3a52", borderRadius: 6, color: "#fff", fontSize: 15, boxSizing: "border-box" };
const btn: React.CSSProperties = { marginTop: 18, width: "100%", padding: 12, background: "#e94f4f", border: "none", borderRadius: 6, color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer" };
