import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminExists, createFirstAdmin } from "@/lib/admin-setup.functions";

export const Route = createFileRoute("/admin/setup")({
  head: () => ({
    meta: [
      { title: "Admin Setup — Wish Well" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const checkExists = useServerFn(adminExists);
  const createAdmin = useServerFn(createFirstAdmin);
  const [state, setState] = useState<"checking" | "closed" | "open" | "done">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    checkExists()
      .then((r) => setState(r.exists ? "closed" : "open"))
      .catch(() => setState("open"));
  }, [checkExists]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await createAdmin({ data: { email, password } });
      setState("done");
      setTimeout(() => navigate({ to: "/admin/login" }), 1500);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Setup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={wrap}>
      <div style={panel}>
        <h1 style={{ marginTop: 0 }}>Admin setup</h1>
        {state === "checking" && <p>Checking…</p>}
        {state === "closed" && (
          <>
            <p>An admin already exists. Setup is closed.</p>
            <Link to="/admin/login" style={{ color: "#e94f4f" }}>Go to login →</Link>
          </>
        )}
        {state === "open" && (
          <>
            <p style={{ color: "#555" }}>
              Create the first (and only) admin account for the Wish Well moderation dashboard.
              This page becomes unavailable once an admin exists.
            </p>
            <form onSubmit={onSubmit}>
              <label style={lbl}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inp} autoComplete="username" />
              <label style={lbl}>Password (min 8 chars)</label>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} style={inp} autoComplete="new-password" />
              {err && <p style={{ color: "#a01a1a" }}>{err}</p>}
              <button type="submit" disabled={busy} style={btn}>{busy ? "Creating…" : "Create admin"}</button>
            </form>
          </>
        )}
        {state === "done" && <p>Admin created. Redirecting to login…</p>}
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = { minHeight: "100vh", background: "#111826", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "system-ui, sans-serif", color: "#eee" };
const panel: React.CSSProperties = { background: "#1c2536", padding: 32, borderRadius: 10, width: "100%", maxWidth: 420, boxShadow: "0 10px 40px rgba(0,0,0,.5)" };
const lbl: React.CSSProperties = { display: "block", margin: "12px 0 6px", fontSize: 14, color: "#c7cfdd" };
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", background: "#0f1420", border: "1px solid #2d3a52", borderRadius: 6, color: "#fff", fontSize: 15, boxSizing: "border-box" };
const btn: React.CSSProperties = { marginTop: 18, width: "100%", padding: 12, background: "#e94f4f", border: "none", borderRadius: 6, color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer" };
