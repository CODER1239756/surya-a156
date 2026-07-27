import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { submitWish, uploadWishFile } from "@/lib/wishes";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Pin a Birthday Wish — Suryanshu Turns 16" },
      { name: "description", content: "Send a handwritten (or typed) birthday wish for Suryanshu's sixteenth. Notes appear on the Wish Well bulletin board after moderation." },
      { property: "og:title", content: "Pin a Birthday Wish" },
      { property: "og:description", content: "Send a birthday wish for Suryanshu's sixteenth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) return setErr("Please share your name.");
    if (!note.trim() && !noteFile) return setErr("Add a typed message or upload a handwritten note.");
    setBusy(true);
    try {
      let notePath: string | undefined;
      let avatarPath: string | undefined;
      if (noteFile) notePath = await uploadWishFile(noteFile, "notes");
      if (avatarFile) avatarPath = await uploadWishFile(avatarFile, "avatars");
      await submitWish({
        senderName: name,
        transcription: note || undefined,
        noteImagePath: notePath,
        profileImagePath: avatarPath,
      });
      setOk(true);
      setTimeout(() => navigate({ to: "/bulletin" }), 2200);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #b98858 0%, #8f5f34 55%, #6a4321 100%)",
        padding: "40px 20px",
        fontFamily: "Georgia, serif",
        color: "#3b2413",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
              fontSize: "2.6rem",
              color: "#fff4dc",
              margin: 0,
              textShadow: "2px 3px 0 rgba(0,0,0,.35)",
            }}
          >
            Pin a wish
          </h1>
          <Link to="/bulletin" style={{ color: "#fff4dc", textDecoration: "underline" }}>
            ← Board
          </Link>
        </div>

        {ok ? (
          <div style={notePanel}>
            <h2 style={{ marginTop: 0 }}>Your wish is on its way. 🎈</h2>
            <p>
              Thanks for adding to Suryanshu's board! It will appear once it's been given a quick look-over.
              Redirecting you to the board…
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={notePanel}>
            <label style={label}>Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              style={input}
              placeholder="e.g. Nani, Drish, Mom"
            />

            <label style={label}>Your wish (typed)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              rows={5}
              style={{ ...input, resize: "vertical", fontFamily: "'Caveat', 'Segoe Script', cursive", fontSize: "1.25rem" }}
              placeholder="Happy 16th, Suryanshu…"
            />

            <label style={label}>Or upload a handwritten note (photo)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNoteFile(e.target.files?.[0] ?? null)}
              style={{ marginBottom: 12 }}
            />

            <label style={label}>Profile picture (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              style={{ marginBottom: 12 }}
            />

            {err && <p style={{ color: "#a01a1a", background: "#ffd7d7", padding: 10, borderRadius: 4 }}>{err}</p>}

            <button type="submit" disabled={busy} style={submitBtn}>
              {busy ? "Pinning…" : "Pin to the board"}
            </button>

            <p style={{ fontSize: 12, color: "#5c3a1e", marginTop: 14 }}>
              Wishes are reviewed before appearing on the public board.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

const notePanel: React.CSSProperties = {
  background: "#f7ecd0",
  padding: 28,
  borderRadius: 4,
  boxShadow: "3px 6px 14px rgba(0,0,0,.35)",
};
const label: React.CSSProperties = { display: "block", fontWeight: 600, margin: "10px 0 6px" };
const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 4,
  border: "1px solid rgba(0,0,0,.2)",
  background: "#fffaf0",
  fontSize: "1rem",
  fontFamily: "inherit",
  boxSizing: "border-box",
};
const submitBtn: React.CSSProperties = {
  background: "#e94f4f",
  color: "#fff4dc",
  padding: "12px 22px",
  border: "none",
  borderRadius: 4,
  fontSize: "1.05rem",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "2px 3px 0 rgba(0,0,0,.35)",
  fontFamily: "Georgia, serif",
};
