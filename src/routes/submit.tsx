import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { submitWish, uploadWishFile } from "@/lib/wishes";
import { useAdminShortcut } from "@/lib/use-admin-shortcut";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Send Suryanshu a Wish — Wish Well Bulletin Board" },
      {
        name: "description",
        content:
          "Write Suryanshu a birthday note, snap a photo of it, and it goes up on the Wish Well bulletin board once it's reviewed.",
      },
      { property: "og:title", content: "Send Suryanshu a Wish" },
      {
        property: "og:description",
        content: "Write him a note, snap a photo of it, and it'll go up on the board once it's reviewed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubmitPage,
});

const CREAM = "#f3eee4";
const MUTED = "#9aa1ac";
const PANEL = "rgba(255,255,255,0.035)";
const LINE = "rgba(255,255,255,0.09)";
const AMBER = "#e8a33d";
const AMBER_SOFT = "#f3c877";

function UploadBox({
  label,
  required,
  hint,
  onFile,
}: {
  label: string;
  required?: boolean;
  hint: string;
  onFile: (f: File | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ marginBottom: "1.4rem" }}>
      <label style={{ display: "block", fontSize: "0.82rem", color: MUTED, marginBottom: "0.4rem" }}>
        {label}
      </label>
      <div
        style={{
          border: `1.5px dashed ${LINE}`,
          borderRadius: 14,
          padding: "1.4rem",
          textAlign: "center",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={required}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            onFile(file);
            if (!file) return setPreview(null);
            const reader = new FileReader();
            reader.onload = (ev) => setPreview(String(ev.target?.result ?? ""));
            reader.readAsDataURL(file);
          }}
          style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
        />
        <div style={{ color: MUTED, fontSize: "0.85rem" }}>{hint}</div>
      </div>
      {preview && (
        <div style={{ marginTop: "0.9rem" }}>
          <img
            src={preview}
            alt="Upload preview"
            style={{ maxWidth: "100%", maxHeight: 220, borderRadius: 8, display: "block", margin: "0 auto" }}
          />
        </div>
      )}
    </div>
  );
}

function SubmitPage() {
  useAdminShortcut();
  const [senderName, setSenderName] = useState("");
  const [transcription, setTranscription] = useState("");
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!noteFile) {
      setStatus("Please attach a photo of your handwritten note.");
      return;
    }
    setBusy(true);
    try {
      const notePath = await uploadWishFile(noteFile, "notes");
      const avatarPath = profileFile ? await uploadWishFile(profileFile, "avatars") : undefined;
      await submitWish({
        senderName: senderName.trim() || "Anonymous",
        transcription: transcription.trim() || undefined,
        noteImagePath: notePath,
        profileImagePath: avatarPath,
      });
      setSent(true);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not send your wish. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: PANEL,
    border: `1px solid ${LINE}`,
    color: CREAM,
    padding: "0.8rem 1rem",
    borderRadius: 10,
    fontFamily: "inherit",
    fontSize: "0.95rem",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        background: "radial-gradient(ellipse at 50% 20%, #121828 0%, #080b12 70%)",
        color: CREAM,
        fontFamily: "'Inter', sans-serif",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6vh 6vw",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500, fontSize: "2.1rem", marginBottom: "1rem" }}>
              Sent.
            </h1>
            <p style={{ color: MUTED }}>
              Thank you — your wish is waiting for a quick review, and then it'll be pinned up on the board.
            </p>
            <p style={{ marginTop: "1.6rem" }}>
              <a href="/bulletin" style={{ color: AMBER_SOFT }}>
                View the board →
              </a>
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: AMBER_SOFT,
                marginBottom: "0.8rem",
                textAlign: "center",
              }}
            >
              Wish Well Bulletin Board
            </div>
            <h1
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 500,
                fontSize: "clamp(1.7rem,4vw,2.3rem)",
                textAlign: "center",
                marginBottom: "0.6rem",
              }}
            >
              Send Suryanshu a Wish
            </h1>
            <p style={{ textAlign: "center", color: MUTED, fontSize: "0.95rem", marginBottom: "2.2rem" }}>
              Write him a note, snap a photo of it, and it'll go up on the board once it's reviewed.
            </p>

            <form onSubmit={onSubmit}>
              <div style={{ marginBottom: "1.4rem" }}>
                <label htmlFor="senderName" style={{ display: "block", fontSize: "0.82rem", color: MUTED, marginBottom: "0.4rem" }}>
                  Your name (optional)
                </label>
                <input
                  id="senderName"
                  type="text"
                  maxLength={120}
                  placeholder="e.g. Devina"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <UploadBox label="Your photo (optional)" hint="Tap to add a small profile picture" onFile={setProfileFile} />
              <UploadBox
                label="Your handwritten note — a photo of it (required)"
                hint="Tap to upload a photo of your note"
                required
                onFile={setNoteFile}
              />

              <div style={{ marginBottom: "1.4rem" }}>
                <label htmlFor="transcription" style={{ display: "block", fontSize: "0.82rem", color: MUTED, marginBottom: "0.4rem" }}>
                  Typed version (optional, in case your handwriting is a little too creative)
                </label>
                <textarea
                  id="transcription"
                  maxLength={2000}
                  placeholder="Happy birthday, Suryanshu!"
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                style={{
                  appearance: "none",
                  border: "none",
                  width: "100%",
                  padding: "1rem",
                  borderRadius: 999,
                  background: `linear-gradient(160deg, ${AMBER_SOFT}, ${AMBER})`,
                  color: "#1a1305",
                  fontWeight: 600,
                  fontSize: "0.98rem",
                  letterSpacing: "0.03em",
                  cursor: busy ? "not-allowed" : "pointer",
                  opacity: busy ? 0.5 : 1,
                }}
              >
                {busy ? "Sending…" : "Send the Wish"}
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.88rem", minHeight: "1.4em", color: status ? "#e08a7d" : MUTED }}>
                {status}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
