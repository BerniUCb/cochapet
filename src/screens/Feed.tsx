import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, Megaphone, PawPrint, Search, Upload } from "lucide-react";
import { Container, EmptyState, PostCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postTitle, sortForFeed, useApp, useMe } from "@/store/useApp";
import { useRequireAuth } from "@/lib/auth";
import { cn, photoSrc } from "@/lib/utils";
import type { PostType } from "@/lib/types";

export type Filter = "todas" | PostType;
export function FilterChips({ value, onChange, counts }: { value: Filter; onChange: (f: Filter) => void; counts?: Record<Filter, number> }) {
  const opts: { id: Filter; label: string }[] = [
    { id: "todas", label: "Todas" },
    { id: "perdida", label: "Perdidas" },
    { id: "encontrada", label: "Encontradas" },
  ];
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filtrar por estado">
      {opts.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "h-11 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            value === o.id ? "bg-ink text-white" : "border border-line bg-surface text-ink-muted hover:text-ink",
          )}
        >
          {o.label}
          {counts && <span className={cn("ml-1.5 tabular-nums", value === o.id ? "text-white/70" : "text-ink-subtle")}>{counts[o.id]}</span>}
        </button>
      ))}
    </div>
  );
}

const STEPS = [
  { icon: <Upload />, title: "Publica en 2 minutos", text: "Fotos, rasgos, zona y tu WhatsApp. Gratis y visible para todos." },
  { icon: <MessageCircle />, title: "Recibe pistas por chat", text: "Quien crea haberla visto te escribe desde la publicación." },
  { icon: <Megaphone />, title: "Amplifica la búsqueda", text: "Anuncios en Facebook e Instagram dirigidos a tu zona, desde Bs. 70." },
];

export default function Feed() {
  const posts = useApp((s) => s.posts);
  const promos = useApp((s) => s.promotions);
  const me = useMe();
  const nav = useNavigate();
  const requireAuth = useRequireAuth();
  const [filter, setFilter] = useState<Filter>("todas");
  const [q, setQ] = useState("");
  const visible = useMemo(() => sortForFeed(posts, promos), [posts, promos]);
  const list = filter === "todas" ? visible : visible.filter((p) => p.type === filter);
  const counts = { todas: visible.length, perdida: visible.filter((p) => p.type === "perdida").length, encontrada: visible.filter((p) => p.type === "encontrada").length };
  const heroPosts = visible.slice(0, 3);
  const publish = () => requireAuth(() => nav("/publicar"), { returnTo: "/publicar", reason: "Inicia sesión para publicar una mascota" });

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-surface">
        <Container className="grid items-center gap-10 py-10 lg:grid-cols-[1.1fr_1fr] lg:py-14">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
              {me ? `Hola, ${me.name.split(" ")[0]}` : "Lost & found de mascotas en Cochabamba"}
            </p>
            <h1 className="mt-3 max-w-[16ch] text-[34px] font-extrabold leading-[1.06] tracking-tight text-ink sm:text-[46px]">
              Encuentra tu mascota. <span className="text-primary">Nosotros amplificamos la búsqueda.</span>
            </h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                nav("/buscar", { state: { q } });
              }}
              className="mt-7 flex max-w-[520px] gap-2"
              role="search"
            >
              <label htmlFor="hero-q" className="sr-only">Buscar por nombre, raza, color o rasgo</label>
              <div className="relative min-w-0 flex-1">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" aria-hidden />
                <Input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej. beagle, collar azul, gato naranja…" className="h-14 pl-11 text-base" />
              </div>
              <Button type="submit" size="lg">Buscar</Button>
            </form>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button variant="outline" onClick={publish}>
                <PawPrint /> Publicar mascota perdida o encontrada
              </Button>
              <dl className="flex gap-6 text-sm">
                <div><dt className="text-ink-subtle">Perdidas</dt><dd className="text-xl font-extrabold tabular-nums text-ink">{counts.perdida}</dd></div>
                <div><dt className="text-ink-subtle">Encontradas</dt><dd className="text-xl font-extrabold tabular-nums text-ink">{counts.encontrada}</dd></div>
              </dl>
            </div>
          </div>
          <div className="relative hidden h-[430px] sm:block" aria-hidden>
            {heroPosts.map((p, i) => (
              <div
                key={p.id}
                className={cn(
                  "absolute overflow-hidden rounded-2xl bg-surface shadow-lift",
                  i === 0 && "left-0 top-6 z-10 w-[52%]",
                  i === 1 && "right-0 top-0 w-[46%]",
                  i === 2 && "bottom-0 right-[8%] z-20 w-[42%]",
                )}
              >
                <img src={photoSrc(p.photos[0])} alt="" className={cn("w-full object-cover", i === 0 ? "aspect-[4/5]" : "aspect-[4/3]")} />
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <span className="truncate text-sm font-bold text-ink">{postTitle(p)}</span>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold", p.type === "perdida" ? "bg-primary text-white" : "bg-success-soft text-[#065F46]")}>
                    {p.type === "perdida" ? "Perdida" : "Encontrada"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <Container className="pt-10">
        <ol className="grid gap-3 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary [&_svg]:size-5">{s.icon}</span>
              <div>
                <p className="text-xs font-bold tabular-nums text-ink-subtle">Paso {i + 1}</p>
                <p className="font-bold text-ink">{s.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>

      {/* Feed */}
      <Container className="pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink">Publicaciones recientes</h2>
            <p className="mt-1 text-sm text-ink-muted">Las destacadas aparecen primero. Las resueltas ya no se muestran.</p>
          </div>
          <FilterChips value={filter} onChange={setFilter} counts={counts} />
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <PostCard key={p.id} post={p} onClick={() => nav(`/publicacion/${p.id}`)} />
          ))}
        </div>
        {list.length === 0 && (
          <EmptyState icon={<PawPrint />} title="Por ahora no hay publicaciones aquí" action={<Button variant="outline" onClick={() => setFilter("todas")}>Ver todas</Button>}>
            Cuando alguien publique una mascota {filter === "perdida" ? "perdida" : "encontrada"} la verás en esta lista.
          </EmptyState>
        )}
        {list.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" onClick={() => nav("/buscar")}>Buscar entre todas las publicaciones <ArrowRight /></Button>
          </div>
        )}
      </Container>

      {/* Promo band */}
      <Container className="pt-14">
        <div className="flex flex-col gap-6 overflow-hidden rounded-2xl bg-ink p-8 text-white md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-[56ch]">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#FFB98F]">Promoción en redes</p>
            <p className="mt-2 text-2xl font-extrabold leading-tight tracking-tight">¿Necesitas que más vecinos la vean?</p>
            <p className="mt-2 text-[15px] leading-relaxed text-white/75">Nuestro equipo publica anuncios pagados en Facebook e Instagram dirigidos a tu zona. Pagas con QR desde la app de tu banco.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {[["Rápido Barrio", 70], ["Super Cobertura", 140], ["Alerta Máxima", 250]].map(([n, p]) => (
              <div key={n} className="rounded-xl bg-white/10 px-4 py-3">
                <p className="text-xs text-white/70">{n}</p>
                <p className="text-lg font-extrabold tabular-nums">Bs.&nbsp;{p}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
