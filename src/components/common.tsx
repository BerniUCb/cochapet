import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, initials, photoSrc, relativeTime } from "@/lib/utils";
import type { Post, Promotion, PromoStatus } from "@/lib/types";
import { PROMO_STEPS } from "@/lib/constants";
import { isFeatured, postTitle, useApp } from "@/store/useApp";

export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  // Original mark: a map pin whose head is a paw pad
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="14" fill="#CC4900" />
      <path d="M24 39c-6.5-7-10-12-10-16.5a10 10 0 0 1 20 0C34 27 30.5 32 24 39Z" fill="#fff" />
      <ellipse cx="24" cy="24.6" rx="3.9" ry="3.3" fill="#CC4900" />
      <circle cx="19.6" cy="19.6" r="1.7" fill="#CC4900" />
      <circle cx="23" cy="17.4" r="1.7" fill="#CC4900" />
      <circle cx="26.6" cy="17.6" r="1.7" fill="#CC4900" />
      <circle cx="29.2" cy="20.4" r="1.6" fill="#CC4900" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-extrabold tracking-tight text-ink", className)}>
      Cocha<span className="text-primary">Pet</span>
    </span>
  );
}

export function StatusBadge({ post, className }: { post: Post; className?: string }) {
  if (post.resolved) return <Badge variant="resuelta" className={className}>Resuelta</Badge>;
  return post.type === "perdida" ? (
    <Badge variant="perdida" className={className}>Perdida</Badge>
  ) : (
    <Badge variant="encontrada" className={className}>Encontrada</Badge>
  );
}

export function FeaturedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="destacada" className={className}>
      <Sparkles size={12} aria-hidden /> Destacada
    </Badge>
  );
}

export function PromoBadge({ status }: { status: PromoStatus }) {
  const label = PROMO_STEPS.find((s) => s.id === status)!.label;
  return <Badge variant={status}>Promoción: {label}</Badge>;
}

export function Avatar({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  const hues = ["#CC4900", "#0F766E", "#7C3AED", "#1D4ED8", "#B45309", "#BE185D"];
  const h = hues[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % hues.length];
  return (
    <span className={cn("inline-grid shrink-0 place-items-center rounded-full font-bold text-white", className)} style={{ width: size, height: size, background: h, fontSize: size * 0.38 }} aria-hidden>
      {initials(name)}
    </span>
  );
}

export function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const promos = useApp((s) => s.promotions);
  const featured = isFeatured(promos, post.id);
  const title = postTitle(post);
  return (
    <button
      onClick={onClick}
      className={cn(
        "group block w-full overflow-hidden rounded-2xl bg-surface text-left shadow-soft transition-shadow hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        featured && "ring-2 ring-primary/70",
      )}
      aria-label={`${title}, ${post.type === "perdida" ? "perdida" : "encontrada"} en ${post.zone}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-alt">
        <img src={photoSrc(post.photos[0])} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" loading="lazy" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <StatusBadge post={post} />
          {featured && <FeaturedBadge />}
        </div>
        {post.photos.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-[#111C2D]/70 px-2 py-1 text-[11px] font-semibold text-white">1/{post.photos.length}</span>
        )}
      </div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-[17px] font-bold text-ink">{title}</h3>
          <p className="mt-0.5 truncate text-sm text-ink-muted">
            {[post.name ? post.species : null, post.breed, post.color].filter(Boolean).join(" · ") || "Sin más datos"}
          </p>
          <p className="mt-2 flex items-center gap-1 text-[13px] font-medium text-ink-muted">
            <MapPin size={14} className="text-primary" aria-hidden /> {post.zone}
          </p>
        </div>
        <span className="shrink-0 pt-1 text-xs font-medium text-ink-subtle">{relativeTime(post.createdAt)}</span>
      </div>
    </button>
  );
}

export function EmptyState({ icon, title, children, action }: { icon: React.ReactNode; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid h-20 w-20 place-items-center rounded-full bg-primary-soft text-primary [&_svg]:size-9">{icon}</div>
      <h3 className="text-base font-bold text-ink text-balance">{title}</h3>
      {children && <p className="mt-1.5 max-w-[30ch] text-sm leading-relaxed text-ink-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PromoStepper({ promo, compact }: { promo: Promotion; compact?: boolean }) {
  const idx = PROMO_STEPS.findIndex((s) => s.id === promo.status);
  return (
    <ol className="flex items-start" aria-label="Estado de la promoción">
      {PROMO_STEPS.map((s, i) => {
        const done = i < idx || (i === idx && promo.status !== "pendiente");
        const current = i === idx;
        return (
          <li key={s.id} className="relative flex flex-1 flex-col items-center text-center" aria-current={current ? "step" : undefined}>
            {i > 0 && <span className={cn("absolute top-[12px] h-[3px] rounded-full", i <= idx ? "bg-primary" : "bg-line")} style={{ left: "calc(-50% + 18px)", right: "calc(50% + 18px)" }} aria-hidden />}
            <span
              className={cn(
                "relative z-[1] grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-bold",
                done && "border-primary bg-primary text-white",
                current && !done && "border-primary bg-surface text-primary",
                current && "ring-4 ring-primary/15",
                !done && !current && "border-line bg-surface text-ink-subtle",
              )}
            >
              {done ? <Check size={14} strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("mt-1.5 px-0.5 font-semibold leading-tight", compact ? "text-[10.5px]" : "text-[11.5px]", current ? "text-primary-hover font-bold" : done ? "text-ink" : "text-ink-subtle")}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function BackLink({ to, label = "Volver", onClick }: { to?: string; label?: string; onClick?: () => void }) {
  const nav = useNavigate();
  const loc = useLocation();
  return (
    <button
      onClick={() => (onClick ? onClick() : to ? nav(to) : loc.key !== "default" ? nav(-1) : nav("/"))}
      className="-ml-2 inline-flex h-11 items-center gap-1.5 rounded-xl px-2 text-sm font-semibold text-ink-muted hover:bg-surface-alt hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <ArrowLeft size={18} aria-hidden /> {label}
    </button>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions, back }: { eyebrow?: React.ReactNode; title: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; back?: React.ReactNode }) {
  return (
    <div className="pb-6 pt-6 sm:pt-8">
      {back && <div className="mb-3">{back}</div>}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.1em] text-primary">{eyebrow}</p>}
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink sm:text-[32px]">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-[62ch] text-[15px] leading-relaxed text-ink-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.06em] text-ink-muted">{children}</h2>
      {aside}
    </div>
  );
}
