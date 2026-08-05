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
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

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
