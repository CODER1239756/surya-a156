import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a New Password — Wish Well" },
      { name: "description", content: "Choose a new password for your Wish Well admin account." },
      { property: "og:title", content: "Set a New Password — Wish Well" },
      { property: "og:description", content: "Choose a new password for your Wish Well admin account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) return setErr("Password must be at least 8 characters.");
    if (password !== confirm) return setErr("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setErr(error.message);
    setDone(true);
    setTimeout(() => navigate({ to: "/admin" }), 1200);
  }

  return (
    <div style={wrap}>
      <div style={panel}>
        <h1 style={{ marginTop: 0 }}>Set a new password</h1>
        {done ? (
          <p style={{ color: "#c7cfdd" }}>Password updated. Taking you to the dashboard…</p>
        ) : !ready ? (
          <p style={{ color: "#8a94a8", lineHeight: 1.6 }}>
            Waiting for a valid reset link. Open the link from your email on this device, or{" "}
            <Link to="/admin/forgot" style={{ color: "#e94f4f" }}>request a new one</Link>.
          </p>
        ) : (
          <form onSubmit={onSubmit}>
            <label style={lbl}>New password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inp} autoComplete="new-password" />
            <label style={lbl}>Confirm password</label>
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inp} autoComplete="new-password" />
            {err && <p style={{ color: "#ff9a9a" }}>{err}</p>}
            <button type="submit" disabled={busy} style={btn}>{busy ? "Saving…" : "Update password"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = { minHeight: "100vh", background: "#111826", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "system-ui, sans-serif", color: "#eee" };
const panel: React.CSSProperties = { background: "#1c2536", padding: 32, borderRadius: 10, width: "100%", maxWidth: 420, boxShadow: "0 10px 40px rgba(0,0,0,.5)" };
const lbl: React.CSSProperties = { display: "block", margin: "12px 0 6px", fontSize: 14, color: "#c7cfdd" };
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", background: "#0f1420", border: "1px solid #2d3a52", borderRadius: 6, color: "#fff", fontSize: 15, boxSizing: "border-box" };
const btn: React.CSSProperties = { marginTop: 18, width: "100%", padding: 12, background: "#e94f4f", border: "none", borderRadius: 6, color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer" };
