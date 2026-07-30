import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

/**
 * Hidden admin entry: hold Ctrl (or Cmd) and press L then O, then type the
 * passphrase in the prompt. This is obscurity only — the real security is the
 * email + password login and the role-based rules on the database, which this
 * shortcut cannot bypass. It simply reveals the admin login route.
 */
export const ADMIN_PASSPHRASE = "SURYA16";

export function useAdminShortcut() {
  const navigate = useNavigate();

  useEffect(() => {
    let armed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function disarm() {
      armed = false;
      if (timer) clearTimeout(timer);
      timer = null;
    }

    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();

      if (key === "l") {
        e.preventDefault();
        armed = true;
        if (timer) clearTimeout(timer);
        timer = setTimeout(disarm, 2000);
        return;
      }

      if (key === "o" && armed) {
        e.preventDefault();
        disarm();
        const answer = window.prompt("Admin passphrase");
        if (answer === null) return;
        if (answer.trim() === ADMIN_PASSPHRASE) {
          navigate({ to: "/admin/login" });
        } else {
          window.alert("Nope.");
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      disarm();
    };
  }, [navigate]);
}
