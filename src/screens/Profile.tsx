import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronRight, LayoutDashboard, LogIn, LogOut, Mail, PawPrint, Phone, Plus, RotateCcw } from "lucide-react";
import { Avatar, Container, EmptyState, PageHeader, PromoBadge, StatusBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { latestPromo, openPromo, postTitle, useApp, useMe } from "@/store/useApp";
import { fakeDelay, formatPhone, photoSrc, relativeTime } from "@/lib/utils";

export default function Profile() {
  const me = useMe();
  const posts = useApp((s) => s.posts);
  const promos = useApp((s) => s.promotions);
  const logout = useApp((s) => s.logout);
  const resetDemo = useApp((s) => s.resetDemo);
  const nav = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const resetButton = (
    <button onClick={() => setConfirmReset(true)} className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-ink-subtle hover:bg-surface-alt hover:text-ink">
      <RotateCcw size={14} /> Reiniciar demo
    </button>
  );
  const resetDialog = (
    <Dialog open={confirmReset} onOpenChange={(o) => busy !== "reset" && setConfirmReset(o)}>
      <DialogContent>
        <DialogTitle>¿Reiniciar la demo?</DialogTitle>
        <DialogDescription>Se borran las publicaciones, mensajes y promociones que creaste, y vuelven los datos de ejemplo.</DialogDescription>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmReset(false)}>Cancelar</Button>
          <Button className="flex-1" loading={busy === "reset"} onClick={async () => {
            setBusy("reset");
            await fakeDelay();
            resetDemo();
            setBusy(null);
            setConfirmReset(false);
            toast.success("Demo reiniciada con los datos de ejemplo");
          }}>Reiniciar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (!me)
    return (
      <Container>
        <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-line bg-surface">
          <EmptyState icon={<LogIn />} title="Aún no iniciaste sesión" action={<Button onClick={() => nav("/bienvenida", { state: { from: "/perfil" } })}>Ingresar o crear cuenta</Button>}>
            Con tu cuenta puedes publicar mascotas, chatear y promocionar tus publicaciones.
          </EmptyState>
        </div>
        <div className="mt-4 flex justify-center">{resetButton}</div>
        {resetDialog}
      </Container>
    );

  const mine = posts.filter((p) => p.ownerId === me.id).sort((a, b) => Number(a.resolved) - Number(b.resolved) || b.createdAt - a.createdAt);
  const active = mine.filter((p) => !p.resolved).length;

  return (
    <Container>
      <PageHeader eyebrow="Mi cuenta" title="Perfil" />
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-surface p-6 shadow-soft">
            <Avatar name={me.name} size={72} />
            <h2 className="mt-4 text-xl font-extrabold text-ink">{me.name}</h2>
            <p className="text-sm text-ink-muted">{me.role === "admin" ? "Administrador de Cocha Pet" : `Miembro desde ${new Date(me.createdAt).toLocaleDateString("es-BO", { month: "long", year: "numeric" })}`}</p>
            <dl className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5 text-sm">
              <div className="flex items-center gap-3"><Mail size={16} className="shrink-0 text-ink-subtle" /><dt className="sr-only">Correo</dt><dd className="min-w-0 truncate text-ink">{me.email}</dd></div>
              <div className="flex items-center gap-3"><Phone size={16} className="shrink-0 text-ink-subtle" /><dt className="sr-only">Teléfono</dt><dd className="text-ink">{me.phone ? formatPhone(me.phone) : <span className="text-ink-subtle">Sin teléfono registrado</span>}</dd></div>
            </dl>
            {me.role !== "admin" && (
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-line pt-5 text-center">
                <div className="rounded-xl bg-surface-alt py-3"><p className="text-xl font-extrabold tabular-nums text-ink">{active}</p><p className="text-xs text-ink-muted">Activas</p></div>
                <div className="rounded-xl bg-surface-alt py-3"><p className="text-xl font-extrabold tabular-nums text-ink">{mine.length - active}</p><p className="text-xs text-ink-muted">Resueltas</p></div>
              </div>
            )}
          </div>
          {me.role === "admin" && <Button size="lg" onClick={() => nav("/admin")}><LayoutDashboard /> Abrir panel de administrador</Button>}
          <Button variant="outline" size="lg" loading={busy === "out"} onClick={async () => {
            setBusy("out");
            await fakeDelay();
            logout();
            setBusy(null);
            toast("Cerraste sesión");
            nav("/", { replace: true });
          }}>
            <LogOut /> Cerrar sesión
          </Button>
          <div className="flex justify-center">{resetButton}</div>
        </aside>

        {me.role !== "admin" ? (
          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold text-ink">Mis publicaciones <span className="font-semibold tabular-nums text-ink-subtle">({mine.length})</span></h2>
              <Button size="sm" onClick={() => nav("/publicar")}><Plus /> Nueva publicación</Button>
            </div>
            {mine.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface">
                <EmptyState icon={<PawPrint />} title="Todavía no publicaste nada" action={<Button onClick={() => nav("/publicar")}>Publicar mascota</Button>}>
                  Si perdiste o encontraste una mascota, publícala para que los vecinos te ayuden.
                </EmptyState>
              </div>
            ) : (
              <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
                {mine.map((p, i) => {
                  const promo = latestPromo(promos, p.id);
                  const open = openPromo(promos, p.id);
                  return (
                    <li key={p.id} className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${i ? "border-t border-line" : ""}`}>
                      <button onClick={() => nav(`/publicacion/${p.id}`)} className="flex min-w-0 flex-1 items-center gap-4 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <img src={photoSrc(p.photos[0])} alt="" className={`h-16 w-16 shrink-0 rounded-xl object-cover ${p.resolved ? "grayscale" : ""}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-ink">{postTitle(p)}</p>
                          <p className="text-xs text-ink-subtle">{p.zone} · publicado {relativeTime(p.createdAt)}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <StatusBadge post={p} />
                            {promo && <PromoBadge status={promo.status} />}
                          </div>
                        </div>
                        <ChevronRight size={18} className="shrink-0 text-ink-subtle sm:hidden" />
                      </button>
                      {!p.resolved && (
                        <div className="flex shrink-0 gap-2">
                          {!open ? (
                            <Button size="sm" variant="secondary" onClick={() => nav(`/promocionar/${p.id}`)}>Promocionar</Button>
                          ) : (
                            <Button size="sm" variant="secondary" onClick={() => nav(`/promocion/${open.id}`)}>
                              {open.status === "pendiente" ? "Completar pago con QR" : "Ver estado de la promoción"}
                            </Button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-extrabold text-ink">Cuenta de administrador</h2>
            <p className="mt-1 text-sm text-ink-muted">Desde el panel puedes ver las promociones pagadas, lanzarlas y marcarlas como finalizadas.</p>
          </section>
        )}
      </div>
      {resetDialog}
    </Container>
  );
}
