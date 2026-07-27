import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchAllWishes,
  setWishStatus,
  deleteWish,
  editWish,
  signedWishImageUrl,
  type WishRow,
} from "@/lib/wishes";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Wish Well Admin Dashboard" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

type Prepared = WishRow & { avatar: string | null; note: string | null };

function AdminDashboard() {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "unauth" | "notadmin" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [wishes, setWishes] = useState<Prepared[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "hidden" | "all">("pending");
  const [userEmail, setUserEmail] = useState<string>("");

  const refresh = useCallback(async () => {
    try {
      const rows = await fetchAllWishes();
      const prepared = await Promise.all(
        rows.map(async (w) => ({
          ...w,
          avatar: await signedWishImageUrl(w.profile_image_url),
          note: await signedWishImageUrl(w.note_image_url),
        }))
      );
      setWishes(prepared);
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setState("unauth");
        return;
      }
      setUserEmail(data.session.user.email ?? "");
      const { data: rolesRow, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error || !rolesRow) {
        setState("notadmin");
        return;
      }
      await refresh();
      setState("ready");
    })();
  }, [refresh]);

  useEffect(() => {
    if (state === "unauth") navigate({ to: "/admin/login" });
  }, [state, navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  const shown = wishes.filter((w) => (filter === "all" ? true : w.status === filter));
  const counts = {
    pending: wishes.filter((w) => w.status === "pending").length,
    approved: wishes.filter((w) => w.status === "approved").length,
    rejected: wishes.filter((w) => w.status === "rejected").length,
    hidden: wishes.filter((w) => w.status === "hidden").length,
    all: wishes.length,
  };

  if (state === "loading") return <Center>Loading dashboard…</Center>;
  if (state === "notadmin")
    return (
      <Center>
        <p>This account is not an admin.</p>
        <button onClick={signOut} style={dangerBtn}>Sign out</button>
      </Center>
    );
  if (state === "error") return <Center>Error: {errMsg}</Center>;

  return (
    <div style={{ minHeight: "100vh", background: "#0e1420", color: "#e8ecf5", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ padding: "16px 24px", borderBottom: "1px solid #1f2a3d", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.4rem" }}>Wish Well — Admin</h1>
          <p style={{ margin: "2px 0 0", color: "#8b96ad", fontSize: 13 }}>Signed in as {userEmail}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/bulletin" style={linkBtn}>View public board</Link>
          <button onClick={signOut} style={dangerBtn}>Sign out</button>
        </div>
      </header>

      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {(["pending", "approved", "rejected", "hidden", "all"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              style={{
                ...tabBtn,
                background: filter === k ? "#e94f4f" : "#1c2536",
                color: filter === k ? "#fff" : "#c7cfdd",
              }}
            >
              {k[0].toUpperCase() + k.slice(1)} · {counts[k]}
            </button>
          ))}
        </div>

        {errMsg && <p style={{ color: "#ff9a9a" }}>{errMsg}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
          {shown.map((w) => (
            <ModerationCard key={w.id} wish={w} onChange={refresh} />
          ))}
          {shown.length === 0 && <p style={{ color: "#8b96ad" }}>No wishes in this bucket.</p>}
        </div>
      </div>
    </div>
  );
}

function ModerationCard({ wish, onChange }: { wish: Prepared; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(wish.sender_name);
  const [text, setText] = useState(wish.transcription ?? "");

  async function act(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
      onChange();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ background: "#1c2536", borderRadius: 8, padding: 16, border: "1px solid #263148" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ ...statusBadge, background: statusColor(wish.status) }}>{wish.status}</span>
        <span style={{ fontSize: 12, color: "#8b96ad" }}>{new Date(wish.created_at).toLocaleString()}</span>
      </div>

      {editing ? (
        <>
          <input value={name} onChange={(e) => setName(e.target.value)} style={editInp} />
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} style={{ ...editInp, resize: "vertical" }} />
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
            {wish.avatar && <img src={wish.avatar} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />}
            <strong>{wish.sender_name}</strong>
          </div>
          {wish.note && <img src={wish.note} alt="handwritten note" style={{ width: "100%", borderRadius: 4, marginBottom: 8 }} />}
          {wish.transcription && <p style={{ margin: "8px 0", color: "#dfe4ef" }}>{wish.transcription}</p>}
        </>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
        {editing ? (
          <>
            <button disabled={busy} onClick={() => act(async () => { await editWish(wish.id, { sender_name: name, transcription: text }); setEditing(false); })} style={smBtn("#3ba7d1")}>Save</button>
            <button disabled={busy} onClick={() => { setEditing(false); setName(wish.sender_name); setText(wish.transcription ?? ""); }} style={smBtn("#4b5567")}>Cancel</button>
          </>
        ) : (
          <>
            {wish.status !== "approved" && (
              <button disabled={busy} onClick={() => act(() => setWishStatus(wish.id, "approved"))} style={smBtn("#3ba76e")}>Approve</button>
            )}
            {wish.status !== "rejected" && (
              <button disabled={busy} onClick={() => act(() => setWishStatus(wish.id, "rejected"))} style={smBtn("#c26a1c")}>Reject</button>
            )}
            {wish.status === "approved" && (
              <button disabled={busy} onClick={() => act(() => setWishStatus(wish.id, "hidden"))} style={smBtn("#6e7686")}>Hide</button>
            )}
            <button disabled={busy} onClick={() => setEditing(true)} style={smBtn("#4b5567")}>Edit</button>
            <button
              disabled={busy}
              onClick={() => {
                if (confirm("Delete this wish permanently?")) act(() => deleteWish(wish.id));
              }}
              style={smBtn("#a63030")}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function statusColor(s: WishRow["status"]) {
  return { pending: "#c98f1a", approved: "#3ba76e", rejected: "#a63030", hidden: "#6e7686" }[s];
}
function smBtn(bg: string): React.CSSProperties {
  return { background: bg, color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, fontSize: 13, cursor: "pointer", fontWeight: 600 };
}
function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "#0e1420", color: "#e8ecf5", fontFamily: "system-ui" }}>{children}</div>;
}
const linkBtn: React.CSSProperties = { background: "#1c2536", color: "#e8ecf5", padding: "8px 14px", borderRadius: 6, textDecoration: "none", fontSize: 14, border: "1px solid #2d3a52" };
const dangerBtn: React.CSSProperties = { background: "#e94f4f", color: "#fff", padding: "8px 14px", borderRadius: 6, border: "none", fontWeight: 600, cursor: "pointer" };
const tabBtn: React.CSSProperties = { padding: "8px 14px", borderRadius: 6, border: "1px solid #2d3a52", cursor: "pointer", fontSize: 14, fontWeight: 500 };
const statusBadge: React.CSSProperties = { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#fff" };
const editInp: React.CSSProperties = { width: "100%", background: "#0f1420", border: "1px solid #2d3a52", color: "#fff", padding: "8px 10px", borderRadius: 4, marginBottom: 8, boxSizing: "border-box", fontFamily: "inherit" };
