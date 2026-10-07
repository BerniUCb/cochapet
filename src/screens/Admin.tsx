import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCheck, Inbox, MapPin, Rocket } from "lucide-react";
import { Avatar, Container, EmptyState, PageHeader, StatusBadge } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { postTitle, useApp } from "@/store/useApp";
import { planById, promoLabel } from "@/lib/constants";
import { cn, fakeDelay, formatBs, formatPhone, photoSrc, relativeTime } from "@/lib/utils";
import type { PromoStatus } from "@/lib/types";

export default function Admin() {
  const promos = useApp((s) => s.promotions);
  const posts = useApp((s) => s.posts);
  const users = useApp((s) => s.users);
  const setStatus = useApp((s) => s.setPromotionStatus);
  const nav = useNavigate();
  const [tab, setTab] = useState<"activas" | "finalizada">("activas");
  const [busy, setBusy] = useState<string | null>(null);

  const count = (s: PromoStatus) => promos.filter((p) => p.status === s).length;
  const income = promos.filter((p) => p.status !== "pendiente").reduce((n, p) => n + p.amount, 0);
  const list = promos
    .filter((p) => (tab === "activas" ? p.status === "pagada" || p.status === "en_curso" : p.status === "finalizada"))
    .sort((a, b) => (a.status === b.status ? (a.paidAt ?? 0) - (b.paidAt ?? 0) : a.status === "pagada" ? -1 : 1));

  const move = async (id: string, s: PromoStatus) => {
    setBusy(id);
    await fakeDelay();
    setStatus(id, s);
    setBusy(null);
    toast.success(s === "en_curso" ? "Promoción marcada En curso. La publicación ya aparece como Destacada." : "Promoción marcada como Finalizada.");
  };

  const stats = [
    { label: "Pendientes de lanzar", value: count("pagada"), note: "Pagadas, esperan anuncio", tone: "text-[#1E40AF]", dot: "bg-[#3B82F6]" },
    { label: "En curso", value: count("en_curso"), note: "Anuncios activos ahora", tone: "text-success-strong", dot: "bg-success" },
    { label: "Finalizadas", value: count("finalizada"), note: "Campañas terminadas", tone: "text-ink", dot: "bg-[#9CA3AF]" },
    { label: "Cobrado", value: formatBs(income), note: "Pagos confirmados", tone: "text-ink", dot: "bg-primary" },
  ];

  return (
    <Container>
      <PageHeader eyebrow="Panel de administrador" title="Solicitudes de promoción" subtitle="Lanza los anuncios en Meta de cada solicitud pagada y actualiza su estado. El cambio se refleja al instante en la publicación del usuario." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface p-5 shadow-soft">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-muted"><span className={cn("h-2 w-2 rounded-full", s.dot)} />{s.label}</p>
            <p className={cn("mt-2 text-[30px] font-extrabold leading-none tabular-nums", s.tone)}>{s.value}</p>
            <p className="mt-1.5 text-xs text-ink-subtle">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist">
        {([["activas", `Pagadas y en curso (${count("pagada") + count("en_curso")})`], ["finalizada", `Finalizadas (${count("finalizada")})`]] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("h-11 rounded-full px-4 text-sm font-semibold", tab === k ? "bg-ink text-white" : "border border-line bg-surface text-ink-muted hover:text-ink")}>
            {l}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="hidden grid-cols-[280px_1fr_200px_190px] gap-6 border-b border-line bg-surface-alt px-5 py-3 text-xs font-bold uppercase tracking-[0.06em] text-ink-muted lg:grid">
          <span>Fotos</span><span>Mascota y zona</span><span>Plan y monto</span><span>Acción</span>
        </div>
        <ul>
          {list.map((pr, i) => {
            const post = posts.find((p) => p.id === pr.postId);
            const owner = users.find((u) => u.id === pr.ownerId);
            if (!post) return null;
            const plan = planById(pr.plan);
            return (
              <li key={pr.id} className={cn("grid gap-4 p-5 lg:grid-cols-[280px_1fr_200px_190px] lg:gap-6", i && "border-t border-line")}>
                <div className="no-scrollbar flex gap-2 overflow-x-auto">
                  {post.photos.map((ph, k) => (
                    <img key={k} src={photoSrc(ph)} alt={`${postTitle(post)}, foto ${k + 1}`} className={cn("shrink-0 rounded-xl object-cover", post.photos.length > 1 ? "h-24 w-24" : "h-24 w-36")} />
                  ))}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => nav(`/publicacion/${post.id}`)} className="text-base font-bold text-ink hover:underline">{postTitle(post)}</button>
                    <StatusBadge post={post} />
                    <Badge variant={pr.status}>{promoLabel(pr.status)}</Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm font-medium text-ink-muted"><MapPin size={14} className="shrink-0 text-primary" /> {post.zone} · {post.reference}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink">{post.description}</p>
                  {owner && (
                    <p className="mt-2 flex items-center gap-2 text-xs text-ink-muted">
                      <Avatar name={owner.name} size={22} /> {owner.name} · {formatPhone(post.contactPhone)}
                    </p>
                  )}
                </div>
                <div className="text-sm">
                  <p className="font-bold text-ink">{plan.name}</p>
                  <p className="text-xs text-ink-muted">{plan.duration} · {plan.reach}</p>
                  <p className="mt-2 text-lg font-extrabold tabular-nums text-ink">{formatBs(pr.amount, true)}</p>
                  <p className="text-xs text-ink-subtle">Ref. {pr.qrRef}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-ink-subtle">
                    {pr.status === "pagada" && pr.paidAt && `Pagada ${relativeTime(pr.paidAt)}`}
                    {pr.status === "en_curso" && pr.startedAt && `Lanzada ${relativeTime(pr.startedAt)}`}
                    {pr.status === "finalizada" && pr.finishedAt && `Finalizó ${relativeTime(pr.finishedAt)}`}
                  </span>
                  {pr.status === "pagada" && <Button loading={busy === pr.id} onClick={() => move(pr.id, "en_curso")}><Rocket /> Marcar En curso</Button>}
                  {pr.status === "en_curso" && <Button variant="outline" loading={busy === pr.id} onClick={() => move(pr.id, "finalizada")}><CheckCheck /> Marcar Finalizada</Button>}
                </div>
              </li>
            );
          })}
        </ul>
        {list.length === 0 && (
          <EmptyState icon={<Inbox />} title={tab === "activas" ? "No hay solicitudes pendientes" : "Aún no hay promociones finalizadas"}>
            {tab === "activas" ? "Cuando un usuario pague una promoción con QR, aparecerá aquí para que la lances." : "Las campañas que marques como finalizadas quedarán en este historial."}
          </EmptyState>
        )}
      </div>
    </Container>
  );
}
