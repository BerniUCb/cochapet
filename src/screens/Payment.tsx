import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, FlaskConical, Megaphone, RefreshCw, Rocket, Timer, Trophy } from "lucide-react";
import { BackLink, Container, PageHeader, PromoStepper } from "@/components/common";
import { Button } from "@/components/ui/button";
import { postTitle, useApp } from "@/store/useApp";
import { planById, promoLabel } from "@/lib/constants";
import { cn, fakeDelay, formatBs, photoSrc, relativeTime } from "@/lib/utils";

function useNow(active: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

export default function Payment() {
  const { id } = useParams();
  const nav = useNavigate();
  const meId = useApp((s) => s.sessionUserId);
  const promo = useApp((s) => s.promotions.find((p) => p.id === id));
  const post = useApp((s) => s.posts.find((p) => p.id === promo?.postId));
  const { confirmPayment, failPayment, renewQr, cancelPromotion } = useApp.getState();
  const [busy, setBusy] = useState<string | null>(null);
  const pending = promo?.status === "pendiente";
  const now = useNow(!!pending);

  if (!meId) return <Navigate to="/bienvenida" replace />;
  if (!promo || !post || promo.ownerId !== meId) return <Navigate to="/perfil" replace />;

  const plan = planById(promo.plan);
  const left = Math.max(0, promo.qrExpiresAt - now);
  const expired = pending && left === 0;
  const mm = String(Math.floor(left / 60000)).padStart(2, "0");
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
  const payload = `COCHAPET|QR-SIMPLE|REF:${promo.qrRef}|MONTO:${promo.amount.toFixed(2)}|MONEDA:BOB|GLOSA:Promocion ${plan.name}`;

  const act = async (k: string, fn: () => void) => {
    setBusy(k);
    await fakeDelay();
    fn();
    setBusy(null);
  };

  const demoControls = (
      <section className="rounded-2xl border-2 border-dashed border-[#C9D1E4] p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-subtle"><FlaskConical size={14} /> Controles de demostración</p>
              <p className="mt-1 text-xs text-ink-subtle">No hay pasarela real. Simula la respuesta del banco:</p>
              <div className="mt-3 flex flex-col gap-2">
                <Button variant="success" loading={busy === "ok"} disabled={!!busy || expired} onClick={() => act("ok", () => { confirmPayment(promo.id); toast.success("¡Pago confirmado! Tu promoción está Pagada."); })}>
                  <CheckCircle2 /> Simular pago confirmado
                </Button>
                <Button variant="outline" className="border-error/40 text-error hover:bg-error-soft" loading={busy === "fail"} disabled={!!busy || expired} onClick={() => act("fail", () => { failPayment(promo.id, "El banco rechazó la transacción (fondos insuficientes). Tu promoción no se activó."); toast.error("El pago fue rechazado"); })}>
                  <AlertCircle /> Simular pago fallido
                </Button>
              </div>
            </section>
  );

  return (
    <Container>
      <PageHeader
        back={<BackLink to={`/publicacion/${post.id}`} label="Volver a la publicación" />}
        eyebrow={`Promoción ${plan.name}`}
        title={pending ? "Paga tu promoción con QR" : "Estado de tu promoción"}
        subtitle={pending ? "Escanea el código con la app de tu banco. La promoción se activa solo cuando el pago se confirma." : undefined}
      />
      <div className="mb-6 rounded-2xl bg-surface p-5 shadow-soft sm:px-8">
        <PromoStepper promo={promo} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="flex min-w-0 flex-col gap-4">
        {pending && (
          <>
            <section className="flex flex-col items-center rounded-2xl bg-surface px-5 pb-8 pt-8 text-center shadow-soft">
              <p className="text-sm font-semibold text-ink-muted">Monto exacto a pagar</p>
              <p className="mt-1 text-[34px] font-extrabold leading-none tabular-nums text-ink">{formatBs(promo.amount, true)}</p>
              <div className={cn("relative mt-5 rounded-2xl border border-line bg-white p-4", expired && "opacity-25")}>
                <QRCodeSVG value={payload} size={240} level="M" fgColor="#111C2D" bgColor="#FFFFFF" title={`QR de pago por ${formatBs(promo.amount, true)}`} />
              </div>
              <p className="mt-4 font-bold text-ink">Escanea con la app de tu banco</p>
              <p className="mt-1 text-xs text-ink-subtle">Referencia {promo.qrRef} · QR válido solo por este monto</p>
              <p className={cn("mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums", expired ? "bg-error-soft text-error" : left < 60000 ? "bg-[#FEF3C7] text-[#92400E]" : "bg-surface-alt text-ink")} aria-live="polite">
                <Timer size={15} /> {expired ? "El QR expiró" : `Vence en ${mm}:${ss}`}
              </p>
            </section>

            {(promo.lastError || expired) && (
              <div role="alert" className="flex gap-3 rounded-2xl border border-error/30 bg-error-soft p-4 text-[#7A1010]">
                <AlertCircle className="mt-0.5 shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="font-bold">{expired ? "El tiempo para pagar terminó" : "El pago no se completó"}</p>
                  <p className="mt-0.5 text-sm">{expired ? "Tu promoción no se activó. Genera un QR nuevo para intentarlo otra vez." : promo.lastError}</p>
                  <Button size="sm" variant="outline" className="mt-3 border-error/40 bg-white" loading={busy === "renew"} onClick={() => act("renew", () => { renewQr(promo.id); toast("Generamos un QR nuevo"); })}>
                    <RefreshCw /> Generar nuevo QR
                  </Button>
                </div>
              </div>
            )}


            <Button variant="ghost" className="text-ink-muted" loading={busy === "cancel"} onClick={() => act("cancel", () => { cancelPromotion(promo.id); toast("Solicitud de promoción cancelada"); nav(`/publicacion/${post.id}`, { replace: true }); })}>
              Cancelar solicitud
            </Button>
          </>
        )}

        {!pending && (
          <section className="rounded-2xl bg-surface p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", promo.status === "finalizada" ? "bg-[#E5E7EB] text-[#374151]" : "bg-success-soft text-success-strong")}>
                {promo.status === "pagada" ? <CheckCircle2 /> : promo.status === "en_curso" ? <Rocket /> : <Trophy />}
              </span>
              <div>
                <p className="text-lg font-extrabold text-ink">{promoLabel(promo.status)}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {promo.status === "pagada" && "Recibimos tu pago. Nuestro equipo lanzará los anuncios en Facebook e Instagram en las próximas horas."}
                  {promo.status === "en_curso" && `Tus anuncios están activos en ${plan.reach === "Facebook + Instagram" ? "Facebook e Instagram" : "Facebook e Instagram"} durante ${plan.duration}. Tu publicación aparece como Destacada.`}
                  {promo.status === "finalizada" && "La campaña terminó. Si la mascota sigue sin aparecer, puedes solicitar una nueva promoción."}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
              <div><dt className="text-ink-subtle">Monto pagado</dt><dd className="font-bold tabular-nums text-ink">{formatBs(promo.amount, true)}</dd></div>
              <div><dt className="text-ink-subtle">Referencia</dt><dd className="font-bold text-ink">{promo.qrRef}</dd></div>
              {promo.paidAt && <div><dt className="text-ink-subtle">Pagada</dt><dd className="font-semibold text-ink">{relativeTime(promo.paidAt)}</dd></div>}
              {promo.startedAt && <div><dt className="text-ink-subtle">Lanzada</dt><dd className="font-semibold text-ink">{relativeTime(promo.startedAt)}</dd></div>}
            </dl>
            {promo.status === "finalizada" && !post.resolved && (
              <Button className="mt-4 w-full" onClick={() => nav(`/promocionar/${post.id}`)}><Megaphone /> Promocionar de nuevo</Button>
            )}
          </section>
        )}
      </div>
      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-surface p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">Publicación</p>
          <button onClick={() => nav(`/publicacion/${post.id}`)} className="mt-3 flex w-full items-center gap-3 text-left">
            <img src={photoSrc(post.photos[0])} alt="" className="h-14 w-14 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ink">{postTitle(post)} · {post.zone}</p>
              <p className="text-sm text-ink-muted">{plan.name} · {plan.duration}</p>
            </div>
          </button>
          <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between gap-2"><dt className="text-ink-muted">Alcance</dt><dd className="text-right font-semibold text-ink">{plan.reach}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-ink-muted">Referencia</dt><dd className="font-semibold text-ink">{promo.qrRef}</dd></div>
            <div className="flex justify-between gap-2 border-t border-line pt-3"><dt className="font-semibold text-ink">Total</dt><dd className="text-lg font-extrabold tabular-nums text-ink">{formatBs(promo.amount, true)}</dd></div>
          </dl>
        </div>
        {pending && demoControls}
      </aside>
      </div>
    </Container>
  );
}
