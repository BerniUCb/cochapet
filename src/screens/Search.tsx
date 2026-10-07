import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search as SearchIcon, SearchX, X } from "lucide-react";
import { Container, EmptyState, PageHeader, PostCard } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sortForFeed, useApp } from "@/store/useApp";
import { cn, normalize } from "@/lib/utils";
import type { Filter } from "./Feed";

const SUGGESTIONS = ["collar", "siamés", "negro", "golden", "naranja", "beagle"];

export default function SearchScreen() {
  const posts = useApp((s) => s.posts);
  const promos = useApp((s) => s.promotions);
  const nav = useNavigate();
  const loc = useLocation();
  const [q, setQ] = useState(((loc.state ?? {}) as { q?: string }).q ?? "");
  const [filter, setFilter] = useState<Filter>("todas");

  const textMatches = useMemo(() => {
    const terms = normalize(q).split(/\s+/).filter(Boolean);
    return sortForFeed(posts, promos).filter((p) => {
      if (!terms.length) return true;
      const hay = normalize([p.name, p.description, p.breed, p.color, p.species].filter(Boolean).join(" "));
      return terms.every((t) => hay.includes(t));
    });
  }, [q, posts, promos]);
  const results = filter === "todas" ? textMatches : textMatches.filter((p) => p.type === filter);
  const counts: Record<Filter, number> = {
    todas: textMatches.length,
    perdida: textMatches.filter((p) => p.type === "perdida").length,
    encontrada: textMatches.filter((p) => p.type === "encontrada").length,
  };
  const clear = () => {
    setQ("");
    setFilter("todas");
  };

  return (
    <Container>
      <PageHeader eyebrow="Buscar" title="Buscar mascotas" subtitle="Escribe el nombre, la raza, el color o un rasgo que recuerdes. Puedes combinarlo con el estado de la publicación." />
      <div className="relative">
        <label htmlFor="search-q" className="sr-only">Buscar por nombre, descripción, raza o color</label>
        <SearchIcon size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" aria-hidden />
        <Input id="search-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej. collar rojo, siamés, labrador negro…" className="h-14 pl-12 pr-14 text-base shadow-soft" autoComplete="off" autoFocus />
        {q && (
          <button onClick={() => setQ("")} className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-xl text-ink-subtle hover:text-ink" aria-label="Borrar búsqueda">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <fieldset>
            <legend className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">Estado</legend>
            <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
              {([["todas", "Todas"], ["perdida", "Perdidas"], ["encontrada", "Encontradas"]] as const).map(([id, label]) => (
                <label
                  key={id}
                  className={cn(
                    "flex h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary",
                    filter === id ? "bg-ink text-white" : "border border-line bg-surface text-ink-muted hover:text-ink lg:border-transparent lg:bg-transparent lg:hover:bg-surface",
                  )}
                >
                  <input type="radio" name="estado" className="sr-only" checked={filter === id} onChange={() => setFilter(id)} />
                  {label}
                  <span className={cn("tabular-nums", filter === id ? "text-white/70" : "text-ink-subtle")}>{counts[id]}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">Prueba con</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => setQ(s)} className="h-9 rounded-full border border-line bg-surface px-3 text-[13px] font-medium text-ink-muted hover:border-[#C9D1E4] hover:text-ink">
                  {s}
                </button>
              ))}
            </div>
          </div>
          {(q || filter !== "todas") && (
            <Button variant="ghost" size="sm" className="self-start" onClick={clear}>Limpiar búsqueda</Button>
          )}
        </aside>

        <section aria-label="Resultados" className="min-w-0">
          <p className="mb-4 text-sm font-semibold text-ink-muted" aria-live="polite">
            {results.length} {results.length === 1 ? "resultado" : "resultados"}
            {q.trim() && <> para <span className="text-ink">“{q.trim()}”</span></>}
          </p>
          {results.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <PostCard key={p.id} post={p} onClick={() => nav(`/publicacion/${p.id}`)} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-surface">
              <EmptyState icon={<SearchX />} title="No encontramos publicaciones que coincidan" action={<Button variant="outline" onClick={clear}>Limpiar búsqueda</Button>}>
                Prueba con otra palabra, como el color o la raza, o quita el filtro de estado.
              </EmptyState>
            </div>
          )}
        </section>
      </div>
    </Container>
  );
}
