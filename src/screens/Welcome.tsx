import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Logo, Wordmark, Avatar } from "@/components/common";
import { useApp } from "@/store/useApp";
import { GOOGLE_DEMO_ACCOUNTS } from "@/seed/data";
import { fakeDelay, photoSrc } from "@/lib/utils";
import type { Intent } from "@/lib/auth";

export function useAfterLogin() {
  const nav = useNavigate();
  const loc = useLocation();
  const st = (loc.state ?? {}) as { from?: string; intent?: Intent };
  return (fallback = "/") => {
    if (st.from && st.from !== "/bienvenida" && st.from !== "/registro") nav(st.from, { replace: true, state: { intent: st.intent } });
    else nav(fallback, { replace: true });
  };
}

function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <span aria-hidden className="grid place-items-center rounded-full bg-white font-extrabold" style={{ width: size, height: size, fontSize: size * 0.8, lineHeight: 1 }}>
      <span style={{ background: "conic-gradient(from -45deg, #EA4335 0 25%, #4285F4 0 50%, #34A853 0 75%, #FBBC05 0)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>G</span>
    </span>
  );
}

export function GoogleChooser({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const googleSignIn = useApp((s) => s.googleSignIn);
  const after = useAfterLogin();
  const [busy, setBusy] = useState<string | null>(null);
  const pick = async (acc: { name: string; email: string }) => {
    setBusy(acc.email);
    await fakeDelay();
    const { user, created } = googleSignIn(acc);
    setBusy(null);
    onOpenChange(false);
    toast.success(created ? `Cuenta creada. ¡Bienvenida, ${user.name.split(" ")[0]}!` : `Hola de nuevo, ${user.name.split(" ")[0]}`);
    after("/");
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent hideClose className="p-0 overflow-hidden" onInteractOutside={(e) => e.preventDefault()}>
        <div className="border-b border-line px-6 pb-4 pt-5">
          <div className="flex items-center gap-2 text-sm font-medium text-ink-muted">
            <GoogleG size={18} /> Acceder con Google
            <span className="ml-auto rounded-full bg-surface-alt px-2 py-0.5 text-[11px] font-semibold">Simulación</span>
          </div>
          <DialogTitle className="mt-4 pr-0 text-xl font-semibold">Elige una cuenta</DialogTitle>
          <DialogDescription>para continuar a Cocha Pet</DialogDescription>
        </div>
        <ul className="py-1">
          {GOOGLE_DEMO_ACCOUNTS.map((a) => (
            <li key={a.email}>
              <button
                onClick={() => pick(a)}
                disabled={!!busy}
                className="flex min-h-[64px] w-full items-center gap-3 px-6 py-3 text-left hover:bg-surface-alt focus-visible:bg-surface-alt focus-visible:outline-none disabled:opacity-60"
              >
                <Avatar name={a.name} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{a.name}</span>
                  <span className="block truncate text-[13px] text-ink-muted">{a.email}</span>
                </span>
                {busy === a.email && <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Entrando" />}
              </button>
            </li>
          ))}
        </ul>
        <p className="px-6 pb-2 text-xs leading-relaxed text-ink-subtle">
          Para continuar, Google compartirá tu nombre y tu correo con Cocha Pet. Este selector es una simulación para la demo.
        </p>
        <div className="flex justify-end border-t border-line px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => { onOpenChange(false); toast("Inicio de sesión cancelado"); }} disabled={!!busy}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink lg:block">
        <div className="absolute inset-0 grid grid-cols-3 gap-3 p-3 opacity-90">
          {["luna1", "atigrada", "toby", "michi", "pug", "rocky", "husky", "mostaza", "luna2"].map((k, i) => (
            <img key={k} src={photoSrc(`seed:${k}`)} alt="" className={`h-full w-full rounded-2xl object-cover ${i % 3 === 1 ? "translate-y-10" : ""}`} />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#111C2D] via-[#111C2D]/55 to-[#111C2D]/10" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#FFB98F]">Cochabamba · Sacaba · Quillacollo</p>
          <p className="mt-3 max-w-[18ch] text-[40px] font-extrabold leading-[1.05] tracking-tight">Encuentra tu mascota. Nosotros amplificamos la búsqueda.</p>
          <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-white/75">Publica gratis, recibe mensajes de quien la vio y, si lo necesitas, lanzamos anuncios en Facebook e Instagram en tu zona.</p>
        </div>
      </aside>
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <button onClick={() => nav("/")} className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Ir al inicio">
            <Logo size={34} />
            <Wordmark className="text-[19px]" />
          </button>
          <Button variant="ghost" size="sm" onClick={() => nav("/")}>Ver publicaciones</Button>
        </div>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">{children}</div>
      </div>
    </div>
  );
}

export default function Welcome() {
  const [google, setGoogle] = useState(false);
  const [adminBusy, setAdminBusy] = useState(false);
  const loginAs = useApp((s) => s.loginAs);
  const nav = useNavigate();
  const loc = useLocation();
  return (
    <AuthLayout>
      <div className="lg:hidden">
        <div className="mb-6 grid grid-cols-3 gap-2">
          {["luna1", "atigrada", "toby"].map((k) => <img key={k} src={photoSrc(`seed:${k}`)} alt="" className="aspect-square w-full rounded-2xl object-cover" />)}
        </div>
      </div>
      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-ink">Ingresa a Cocha Pet</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
        <span className="font-semibold text-ink">Encuentra tu mascota. Nosotros amplificamos la búsqueda.</span> Con tu cuenta puedes publicar, escribir a otros vecinos y promocionar tus publicaciones.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Button size="lg" variant="outline" className="border-[#C9D1E4]" onClick={() => setGoogle(true)}>
          <GoogleG /> Continuar con Google
        </Button>
        <div className="flex items-center gap-3 py-1 text-xs font-semibold text-ink-subtle" aria-hidden>
          <span className="h-px flex-1 bg-line" /> o <span className="h-px flex-1 bg-line" />
        </div>
        <Button size="lg" asChild>
          <Link to="/registro" state={loc.state}>Crear cuenta</Link>
        </Button>
      </div>
      <div className="mt-10 rounded-2xl border border-dashed border-[#C9D1E4] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-subtle">Acceso de demostración</p>
        <Button
          variant="secondary"
          className="mt-3 w-full"
          loading={adminBusy}
          onClick={async () => {
            setAdminBusy(true);
            await fakeDelay();
            loginAs("u_admin");
            toast.success("Entraste como Admin Patas");
            nav("/admin", { replace: true });
          }}
        >
          <ShieldCheck /> Entrar como administrador
        </Button>
      </div>
      <GoogleChooser open={google} onOpenChange={setGoogle} />
    </AuthLayout>
  );
}
