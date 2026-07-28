import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

/**
 * Hidden admin entry: press Ctrl+A (or Cmd+A) anywhere on the page, then type
 * the passphrase in the prompt. This is obscurity only — the real security is
 * the email + password login and the role-based rules on the database, which
 * this shortcut cannot bypass. It simply reveals the admin login route.
 */
export const ADMIN_PASSPHRASE = "SURYA16";

export function useAdminShortcut() {
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.key === "a" || e.key === "A")) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
      e.preventDefault();
      const answer = window.prompt("Admin passphrase");
      if (answer === null) return;
      if (answer.trim() === ADMIN_PASSPHRASE) {
        navigate({ to: "/admin/login" });
      } else {
        window.alert("Nope.");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);
}
