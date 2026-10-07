import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Copy, MapPin, Megaphone, MessageCircle, Phone, Share2, Sparkles, X } from "lucide-react";
import { Avatar, BackLink, Container, EmptyState, FeaturedBadge, PromoStepper, StatusBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { isFeatured, latestPromo, openPromo, postTitle, useApp } from "@/store/useApp";
import { useRequireAuth, type Intent } from "@/lib/auth";
import { cn, fakeDelay, formatPhone, longDate, photoSrc, relativeTime } from "@/lib/utils";
import { planById, promoLabel } from "@/lib/constants";

function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const n = photos.length;
  const go = (k: number) => setI((k + n) % n);
  return (
    <div>
      <div
        className="relative overflow-hidden rounded-2xl bg-ink"
        aria-roledescription="carrusel"
        aria-label="Fotos de la mascota"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(i - 1);
          if (e.key === "ArrowRight") go(i + 1);
        }}
      >
        <img src={photoSrc(photos[i])} alt={`${alt}, foto ${i + 1} de ${n}`} className="aspect-[4/3] w-full object-cover" />
        {n > 1 && (
          <>
            <button onClick={() => go(i - 1)} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-ink shadow-soft hover:bg-surface" aria-label="Foto anterior"><ChevronLeft size={22} /></button>
            <button onClick={() => go(i + 1)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-ink shadow-soft hover:bg-surface" aria-label="Foto siguiente"><ChevronRight size={22} /></button>
            <span className="absolute bottom-3 right-3 rounded-full bg-[#111C2D]/70 px-2.5 py-1 text-xs font-semibold tabular-nums text-white">{i + 1} / {n}</span>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="mt-3 flex gap-2">
          {photos.map((p, k) => (
            <button key={k} onClick={() => setI(k)} className={cn("h-20 w-20 overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-bg transition", k === i ? "ring-primary" : "ring-transparent opacity-70 hover:opacity-100")} aria-label={`Ver foto ${k + 1}`} aria-current={k === i}>
              <img src={photoSrc(p)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Detail() {
  const { id } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const state = (loc.state ?? {}) as { justPublished?: boolean; intent?: Intent };
  const post = useApp((s) => s.posts.find((p) => p.id === id));
  const owner = useApp((s) => s.users.find((u) => u.id === post?.ownerId));
  const meId = useApp((s) => s.sessionUserId);
  const promos = useApp((s) => s.promotions);
  const resolvePost = useApp((s) => s.resolvePost);
  const openConversation = useApp((s) => s.openConversation);
  const requireAuth = useRequireAuth();
  const [contact, setContact] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [banner, setBanner] = useState(!!state.justPublished);

  const mine = !!post && post.ownerId === meId;
  const promo = post ? latestPromo(promos, post.id) : undefined;
  const open = post ? openPromo(promos, post.id) : undefined;

  const startChat = async () => {
    if (!post) return;
    setBusy("chat");
    await fakeDelay();
    const cid = openConversation(post.id);
    setBusy(null);
    nav(`/mensajes/${cid}`);
  };
  const goPromote = () => {
    if (!post) return;
    if (open) nav(`/promocion/${open.id}`);
    else nav(`/promocionar/${post.id}`);
  };

  // resume the action that required login
  useEffect(() => {
    if (!meId || !state.intent || !post) return;
    const intent = state.intent;
    nav(loc.pathname, { replace: true, state: {} });
    if (intent === "chat" && !mine) startChat();
    if (intent === "contacto") setContact(true);
    if (intent === "promocionar" && mine) goPromote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meId]);

  if (!post || !owner)
    return (
      <Container>
        <div className="pt-6"><BackLink to="/" label="Volver al inicio" /></div>
        <EmptyState icon={<X />} title="Esta publicación ya no existe">Puede que la hayan quitado o que hayas reiniciado la demo.</EmptyState>
      </Container>
    );

  const title = postTitle(post);
  const featured = isFeatured(promos, post.id);
  const lost = post.type === "perdida";
  const wa = `https://wa.me/591${post.contactPhone}?text=${encodeURIComponent(`Hola, te escribo por la publicación de ${title} en Cocha Pet.`)}`;

  const copy = async (text: string, ok: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(ok);
    } catch {
      toast("No se pudo copiar en este navegador; selecciona el texto para copiarlo.");
    }
  };

  return (
    <Container>
      <div className="flex items-center justify-between gap-2 pb-4 pt-5">
        <BackLink label="Volver" />
        <Button variant="ghost" size="sm" onClick={() => copy(`${title}: ${lost ? "perdida" : "encontrada"} en ${post.zone}, Cochabamba. Mírala en Cocha Pet.`, "Texto copiado para compartir")}>
          <Share2 /> Compartir
        </Button>
      </div>

      {banner && mine && !post.resolved && !open && (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-ink p-5 text-white shadow-lift animate-fade-up sm:flex-row sm:items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary"><Megaphone size={22} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold">¿Quieres que más personas la vean?</p>
            <p className="mt-0.5 text-sm text-white/75">Lanzamos anuncios en Facebook e Instagram dirigidos a {post.zone} desde Bs.&nbsp;70.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => nav(`/promocionar/${post.id}`)}>Promocionar</Button>
            <button onClick={() => setBanner(false)} className="grid h-11 w-11 place-items-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white" aria-label="Cerrar aviso"><X size={18} /></button>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10">
        {/* Left: media + description */}
        <div className="min-w-0">
          <Gallery photos={post.photos} alt={title} />
          <section className="mt-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">Descripción y rasgos</h2>
            <p className="mt-3 max-w-[68ch] whitespace-pre-line text-base leading-relaxed text-ink">{post.description}</p>
          </section>
          <section className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><MapPin size={20} /></span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink-subtle">{lost ? "Zona donde se perdió" : "Zona donde se encontró"}</p>
                <p className="font-bold text-ink">{post.zone}, Cochabamba</p>
                <p className="text-sm text-ink-muted">{post.reference}</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><CalendarDays size={20} /></span>
              <div>
                <p className="text-xs font-semibold text-ink-subtle">{lost ? "Fecha de pérdida" : "Fecha del hallazgo"}</p>
                <p className="font-bold text-ink">{longDate(post.date)}</p>
                <p className="text-sm text-ink-muted">Publicado {relativeTime(post.createdAt)}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right: summary + actions */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-surface p-6 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge post={post} />
              {featured && <FeaturedBadge />}
            </div>
            <h1 className="mt-3 text-[32px] font-extrabold leading-tight tracking-tight text-ink">{title}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-ink-muted"><MapPin size={14} className="text-primary" /> {post.zone} · {relativeTime(post.createdAt)}</p>
            <dl className="mt-5 grid grid-cols-3 gap-2">
              {[["Especie", post.species], ["Raza", post.breed || "—"], ["Color", post.color || "—"]].map(([k, v]) => (
                <div key={k} className="min-w-0 rounded-xl bg-surface-alt px-3 py-2.5">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-subtle">{k}</dt>
                  <dd className="mt-0.5 truncate text-sm font-semibold text-ink" title={v}>{v}</dd>
                </div>
              ))}
            </dl>

            {post.resolved && (
              <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#E5E7EB] p-4 text-[#374151]">
                <CheckCircle2 className="shrink-0" />
                <p className="text-sm font-semibold">{lost ? "¡Esta mascota ya volvió a casa!" : "Esta mascota ya se reunió con su familia."} Ya no aparece en el inicio ni en la búsqueda.</p>
              </div>
            )}

            {!post.resolved && (
              <div className="mt-6 flex flex-col gap-2.5">
                {mine ? (
                  <>
                    <Button size="lg" onClick={goPromote}>
                      <Megaphone /> {!open ? "Promocionar" : open.status === "pendiente" ? "Completar pago de la promoción" : "Ver estado de la promoción"}
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => setConfirm(true)}><CheckCircle2 /> Marcar como resuelta</Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" loading={busy === "chat"} onClick={() => requireAuth(startChat, { returnTo: loc.pathname, intent: "chat", reason: "Inicia sesión para enviar un mensaje" })}>
                      <MessageCircle /> Enviar mensaje
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => requireAuth(() => setContact(true), { returnTo: loc.pathname, intent: "contacto", reason: "Inicia sesión para ver el contacto" })}>
                      <Phone /> Ver contacto
                    </Button>
                  </>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
              <Avatar name={owner.name} size={44} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink-subtle">Publicado por</p>
                <p className="truncate font-bold text-ink">{mine ? `${owner.name} (tú)` : owner.name}</p>
              </div>
            </div>
          </div>

          {mine && promo && (
            <div className="rounded-2xl bg-surface p-6 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 font-bold text-ink"><Sparkles size={16} className="text-primary" /> Promoción {planById(promo.plan).name}</p>
                <Button variant="link" className="h-11" onClick={() => nav(`/promocion/${promo.id}`)}>Ver detalle</Button>
              </div>
              <p className="mb-5 text-sm text-ink-muted">Estado: {promoLabel(promo.status)}</p>
              <PromoStepper promo={promo} />
            </div>
          )}
        </aside>
      </div>

      <Dialog open={contact} onOpenChange={setContact}>
        <DialogContent>
          <DialogTitle>Contacto de {owner.name.split(" ")[0]}</DialogTitle>
          <DialogDescription>Teléfono indicado en la publicación de {title}.</DialogDescription>
          <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-surface-alt px-4 py-3">
            <span className="select-all text-xl font-bold tabular-nums text-ink">{formatPhone(post.contactPhone)}</span>
            <button onClick={() => copy(`+591${post.contactPhone}`, "Número copiado")} className="grid h-11 w-11 place-items-center rounded-xl text-ink-muted hover:bg-surface" aria-label="Copiar número"><Copy size={18} /></button>
          </div>
          <Button asChild size="lg" className="mt-4 w-full bg-[#128C4A] hover:bg-[#0E6F3A]">
            <a href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle /> Escribir por WhatsApp</a>
          </Button>
          <p className="mt-3 text-center text-xs text-ink-subtle">Se abre WhatsApp en una pestaña nueva. Si no abre, llama o escribe al número de arriba.</p>
        </DialogContent>
      </Dialog>

      <Dialog open={confirm} onOpenChange={(o) => busy !== "resolve" && setConfirm(o)}>
        <DialogContent>
          <DialogTitle>¿Marcar como resuelta?</DialogTitle>
          <DialogDescription>
            {lost ? `Confirma que ${title} ya volvió a casa.` : "Confirma que la mascota ya se reunió con su familia."} La publicación dejará de aparecer en el inicio y en las búsquedas. No se puede deshacer.
          </DialogDescription>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setConfirm(false)} disabled={busy === "resolve"}>Cancelar</Button>
            <Button
              variant="success"
              className="flex-1"
              loading={busy === "resolve"}
              onClick={async () => {
                setBusy("resolve");
                await fakeDelay();
                resolvePost(post.id);
                setBusy(null);
                setConfirm(false);
                toast.success("¡Qué alegría! La publicación quedó como resuelta.");
              }}
            >
              Sí, resuelta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
