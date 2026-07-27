import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Suryanshu Turns Sixteen — A birthday experience" },
      {
        name: "description",
        content:
          "An immersive birthday experience for Suryanshu's sixteenth — memories, wishes, and a Wish Well bulletin board from friends and family.",
      },
      { property: "og:title", content: "Suryanshu Turns Sixteen" },
      {
        property: "og:description",
        content:
          "An immersive birthday experience for Suryanshu's sixteenth — memories, wishes, and a Wish Well bulletin board.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/experience/index.html");
  }, []);
  return (
    <div style={{ minHeight: "100vh", background: "#080b12", color: "#c9c1b1", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "serif" }}>
      Loading the experience…
    </div>
  );
}
