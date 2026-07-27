import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — Wish Well" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setErr(error.message);
    navigate({ to: "/admin" });
  }

  return (
    <div style={wrap}>
      <div style={panel}>
        <h1 style={{ marginTop: 0 }}>Admin login</h1>
        <form onSubmit={onSubmit}>
          <label style={lbl}>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inp} autoComplete="username" />
          <label style={lbl}>Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inp} autoComplete="current-password" />
          {err && <p style={{ color: "#ff9a9a" }}>{err}</p>}
          <button type="submit" disabled={busy} style={btn}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <p style={{ marginTop: 18, fontSize: 13, color: "#8a94a8" }}>
          First time? <Link to="/admin/setup" style={{ color: "#e94f4f" }}>Set up the admin account</Link>.
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
