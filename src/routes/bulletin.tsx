import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchApprovedWishes, signedWishImageUrl, type WishRow } from "@/lib/wishes";

export const Route = createFileRoute("/bulletin")({
  head: () => ({
    meta: [
      { title: "Wish Well Bulletin Board — Suryanshu Turns 16" },
      { name: "description", content: "A corkboard of birthday wishes for Suryanshu's sixteenth from friends and family." },
      { property: "og:title", content: "Wish Well Bulletin Board" },
      { property: "og:description", content: "A corkboard of handwritten birthday wishes for Suryanshu's sixteenth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BulletinPage,
});

type PreparedWish = WishRow & { resolvedNoteUrl: string | null; resolvedAvatarUrl: string | null };

const TINTS: Record<string, string> = {
  cream: "#f7ecd0",
  yellow: "#fbe58a",
  pink: "#f7c8d2",
  mint: "#c8e6c4",
  blue: "#bfd8ec",
};

function paperBg(tint: string | null) {
  return TINTS[tint ?? "cream"] ?? TINTS.cream;
}

function BulletinPage() {
  const [wishes, setWishes] = useState<PreparedWish[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchApprovedWishes();
        const prepared = await Promise.all(
          rows.map(async (w) => ({
            ...w,
            resolvedNoteUrl: await signedWishImageUrl(w.note_image_url),
            resolvedAvatarUrl: await signedWishImageUrl(w.profile_image_url),
          }))
        );
        setWishes(prepared);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load wishes");
      }
    })();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        // organic cork background
        background:
          "radial-gradient(ellipse at top, #b98858 0%, #8f5f34 55%, #6a4321 100%)",
        padding: "40px 20px 80px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "#3b2413",
      }}
    >
      {/* subtle cork noise overlay */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0,0,0,.18) 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, rgba(0,0,0,.14) 0 2px, transparent 3px), radial-gradient(circle at 40% 80%, rgba(255,255,255,.06) 0 1px, transparent 2px)",
          backgroundSize: "180px 180px, 240px 240px, 120px 120px",
          mixBlendMode: "multiply",
          opacity: 0.9,
        }}
      />

      <header style={{ maxWidth: 1100, margin: "0 auto 32px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1
              style={{
                fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                margin: 0,
                color: "#fff4dc",
                textShadow: "2px 3px 0 rgba(0,0,0,.35)",
              }}
            >
              The Wish Well Bulletin Board
            </h1>
            <p style={{ color: "#f2e2c1", marginTop: 6, fontStyle: "italic" }}>
              Sixteen years of Suryanshu — pinned by friends and family.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link
              to="/submit"
              style={pinBtn("#f4c542", "#3b2413")}
            >
              ✎ Pin a wish
            </Link>
            <a href="/experience/index.html" style={pinBtn("#fff4dc", "#3b2413")}>
              ← Back to experience
            </a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {err && <p style={{ color: "#ffdede", textAlign: "center" }}>{err}</p>}
        {!wishes && !err && <p style={{ color: "#f2e2c1", textAlign: "center" }}>Unpinning wishes…</p>}
        {wishes && wishes.length === 0 && (
          <p style={{ color: "#f2e2c1", textAlign: "center", fontStyle: "italic" }}>
            The board is empty. Be the first to pin a wish.
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 28,
            alignItems: "start",
          }}
        >
          {wishes?.map((w) => (
            <WishCard key={w.id} wish={w} />
          ))}
        </div>
      </main>
    </div>
  );
}

function pinBtn(bg: string, fg: string): React.CSSProperties {
  return {
    background: bg,
    color: fg,
    padding: "10px 18px",
    borderRadius: 4,
    textDecoration: "none",
    fontWeight: 600,
    boxShadow: "2px 3px 0 rgba(0,0,0,.35)",
    border: "1px solid rgba(0,0,0,.15)",
    fontFamily: "Georgia, serif",
  };
}

function WishCard({ wish }: { wish: PreparedWish }) {
  const rotation = wish.rotation ?? (Math.random() * 8 - 4);
  const pin = wish.pin_color ?? "#e94f4f";
  return (
    <article
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: "transform .3s ease",
        position: "relative",
        padding: "26px 20px 18px",
        background: paperBg(wish.paper_tint),
        boxShadow: "3px 6px 14px rgba(0,0,0,.35), inset 0 0 30px rgba(0,0,0,.05)",
        borderRadius: 2,
        minHeight: 200,
        fontFamily: "'Caveat', 'Comic Sans MS', 'Brush Script MT', cursive",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = `rotate(${rotation / 2}deg) scale(1.03)`)}
      onMouseLeave={(e) => (e.currentTarget.style.transform = `rotate(${rotation}deg)`)}
    >
      {/* Pin */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 30%, #fff 0%, ${pin} 45%, #000 120%)`,
          boxShadow: "1px 2px 3px rgba(0,0,0,.5)",
        }}
      />
      {wish.resolvedNoteUrl && (
        <img
          src={wish.resolvedNoteUrl}
          alt={`Handwritten note from ${wish.sender_name}`}
          style={{ width: "100%", borderRadius: 2, marginBottom: 10 }}
        />
      )}
      {wish.transcription && (
        <p style={{ fontSize: "1.4rem", lineHeight: 1.3, color: "#2a1b0d", margin: 0 }}>{wish.transcription}</p>
      )}
      <footer
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 14,
          fontFamily: "'Caveat','Brush Script MT', cursive",
          fontSize: "1.15rem",
          color: "#5c3a1e",
        }}
      >
        {wish.resolvedAvatarUrl && (
          <img
            src={wish.resolvedAvatarUrl}
            alt=""
            style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(0,0,0,.2)" }}
          />
        )}
        <span>— {wish.sender_name}</span>
      </footer>
    </article>
  );
}
