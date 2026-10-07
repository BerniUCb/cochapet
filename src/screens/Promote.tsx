import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Check, Clock, MapPin, Megaphone, QrCode, ShieldCheck, Target } from "lucide-react";
import { BackLink, Container, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { openPromo, postTitle, useApp } from "@/store/useApp";
import { PLANS } from "@/lib/constants";
import { cn, fakeDelay, formatBs, photoSrc } from "@/lib/utils";
import type { PlanId } from "@/lib/types";

export default function Promote() {
  const { postId } = useParams();
  const nav = useNavigate();
  const meId = useApp((s) => s.sessionUserId);
  const post = useApp((s) => s.posts.find((p) => p.id === postId));
  const promos = useApp((s) => s.promotions);
  const request = useApp((s) => s.requestPromotion);
  const [plan, setPlan] = useState<PlanId>("super");
  const [busy, setBusy] = useState(false);

  if (!meId) return <Navigate to="/bienvenida" replace state={{ from: `/publicacion/${postId}`, intent: "promocionar" }} />;
  if (!post || post.ownerId !== meId || post.resolved) return <Navigate to="/perfil" replace />;
  const existing = openPromo(promos, post.id);
  if (existing && existing.status !== "pendiente") return <Navigate to={`/promocion/${existing.id}`} replace />;

  const selected = PLANS.find((p) => p.id === plan)!;
  const pay = async () => {
    setBusy(true);
    await fakeDelay();
    const pr = request(post.id, plan);
    setBusy(false);
    nav(`/promocion/${pr.id}`, { replace: true });
  };

  return (
    <Container>
      <PageHeader
        back={<BackLink to={`/publicacion/${post.id}`} label="Volver a la publicación" />}
        eyebrow="Promocionar publicación"
        title="Llega a más vecinos de tu zona"
        subtitle="Nuestro equipo publica anuncios pagados en Facebook e Instagram dirigidos a tu zona, con la foto y los datos de tu publicación."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <fieldset className="min-w-0">
          <legend className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">Elige un plan</legend>
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((p) => (
              <label
                key={p.id}
                className={cn(
                  "relative flex cursor-pointer flex-col rounded-2xl border-2 bg-surface p-5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary",
                  plan === p.id ? "border-primary shadow-lift" : "border-line hover:border-[#C9D1E4]",
                )}
              >
                <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} className="sr-only" />
                <div className="flex items-start justify-between gap-2">
                  <span className="text-base font-bold text-ink">{p.name}</span>
                  <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border-2", plan === p.id ? "border-primary bg-primary text-white" : "border-[#C9D1E4]")}>
                    {plan === p.id && <Check size={14} strokeWidth={3} />}
                  </span>
                </div>
                <span className="mt-1 h-6">{p.recommended && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary-hover">Recomendado</span>}</span>
                <span className="mt-3 text-[34px] font-extrabold leading-none tabular-nums text-ink">{formatBs(p.price)}</span>
                <span className="mt-1 text-xs text-ink-subtle">pago único con QR</span>
                <ul className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-sm text-ink-muted">
                  <li className="flex items-center gap-2"><Clock size={15} className="text-primary" /> {p.duration}</li>
                  <li className="flex items-center gap-2"><Target size={15} className="text-primary" /> {p.reach}</li>
                  <li className="flex items-start gap-2"><Megaphone size={15} className="mt-0.5 shrink-0 text-primary" /> {p.detail}</li>
                </ul>
              </label>
            ))}
          </div>
        </fieldset>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-surface p-5 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">Resumen</p>
            <div className="mt-4 flex items-center gap-3">
              <img src={photoSrc(post.photos[0])} alt="" className="h-14 w-14 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="truncate font-bold text-ink">{postTitle(post)}</p>
                <p className="flex items-center gap-1 text-sm text-ink-muted"><MapPin size={13} className="text-primary" /> {post.zone}</p>
              </div>
            </div>
            <dl className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between gap-2"><dt className="text-ink-muted">Plan</dt><dd className="font-semibold text-ink">{selected.name}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-ink-muted">Duración</dt><dd className="font-semibold text-ink">{selected.duration}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-ink-muted">Redes</dt><dd className="font-semibold text-ink">Facebook + Instagram</dd></div>
              <div className="mt-2 flex items-baseline justify-between gap-2 border-t border-line pt-3"><dt className="font-semibold text-ink">Total a pagar</dt><dd className="text-2xl font-extrabold tabular-nums text-ink">{formatBs(selected.price, true)}</dd></div>
            </dl>
            <Button size="lg" className="mt-5 w-full" loading={busy} onClick={pay}>
              <QrCode /> Pagar {formatBs(selected.price)} con QR
            </Button>
            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-subtle"><ShieldCheck size={14} className="mt-0.5 shrink-0" /> El anuncio se lanza después de confirmar tu pago. Verás el avance en el estado de la promoción.</p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
