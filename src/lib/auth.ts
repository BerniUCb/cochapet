import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useApp } from "@/store/useApp";

export type Intent = "chat" | "contacto" | "promocionar" | undefined;

/** Returns a guard: if logged in runs fn, else sends to welcome and remembers where to come back. */
export function useRequireAuth() {
  const nav = useNavigate();
  const loc = useLocation();
  const logged = useApp((s) => !!s.sessionUserId);
  return (fn: () => void, opts?: { returnTo?: string; intent?: Intent; reason?: string }) => {
    if (logged) return fn();
    toast.info(opts?.reason ?? "Inicia sesión para continuar");
    nav("/bienvenida", { state: { from: opts?.returnTo ?? loc.pathname, intent: opts?.intent } });
  };
}
