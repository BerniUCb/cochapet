import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LogIn, MessageCircle, MessagesSquare, SendHorizontal } from "lucide-react";
import { Avatar, Container, EmptyState, StatusBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import { postTitle, useApp } from "@/store/useApp";
import { clockTime, cn, photoSrc } from "@/lib/utils";

function ConversationList({ activeId }: { activeId?: string }) {
  const meId = useApp((s) => s.sessionUserId)!;
  const convs = useApp((s) => s.conversations);
  const posts = useApp((s) => s.posts);
  const users = useApp((s) => s.users);
  const typing = useApp((s) => s.typing);
  const nav = useNavigate();
  const mine = convs.filter((c) => c.participants.includes(meId) && (c.messages.length > 0 || c.id === activeId)).sort((a, b) => b.updatedAt - a.updatedAt);

  if (mine.length === 0)
    return (
      <EmptyState icon={<MessageCircle />} title="Todavía no tienes conversaciones" action={<Button variant="outline" onClick={() => nav("/")}>Ver publicaciones</Button>}>
        Cuando escribas a alguien desde una publicación, o alguien te escriba, la conversación aparecerá aquí.
      </EmptyState>
    );

  return (
    <ul className="divide-y divide-line/80">
      {mine.map((c) => {
        const post = posts.find((p) => p.id === c.postId);
        const other = users.find((u) => u.id === c.participants.find((p) => p !== meId));
        const last = c.messages[c.messages.length - 1];
        const unread = c.unread[meId] ?? 0;
        const active = c.id === activeId;
        return (
          <li key={c.id}>
            <button
              onClick={() => nav(`/mensajes/${c.id}`, { replace: !!activeId })}
              aria-current={active || undefined}
              className={cn("flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary", active ? "bg-primary-soft/60" : "hover:bg-surface-alt")}
            >
              <img src={post ? photoSrc(post.photos[0]) : ""} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-surface-alt object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("truncate text-[15px] text-ink", unread ? "font-extrabold" : "font-bold")}>{other?.name ?? "Usuario"}</p>
                  <span className={cn("shrink-0 text-xs tabular-nums", unread ? "font-bold text-primary" : "text-ink-subtle")}>{last ? clockTime(last.at) : ""}</span>
                </div>
                <p className="truncate text-xs font-semibold text-primary-hover">Por: {post ? postTitle(post) : "Publicación eliminada"}{post?.resolved ? " · Resuelta" : ""}</p>
                <div className="flex items-center gap-2">
                  <p className={cn("min-w-0 flex-1 truncate text-sm", unread ? "font-semibold text-ink" : "text-ink-muted")}>
                    {typing[c.id] ? <span className="italic text-success-strong">escribiendo…</span> : last ? `${last.senderId === meId ? "Tú: " : ""}${last.text}` : "Nueva conversación"}
                  </p>
                  {unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white" aria-label={`${unread} sin leer`}>{unread}</span>}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ChatPane({ id }: { id: string }) {
  const nav = useNavigate();
  const meId = useApp((s) => s.sessionUserId)!;
  const conv = useApp((s) => s.conversations.find((c) => c.id === id));
  const post = useApp((s) => s.posts.find((p) => p.id === conv?.postId));
  const other = useApp((s) => s.users.find((u) => u.id === conv?.participants.find((p) => p !== s.sessionUserId)));
  const typing = useApp((s) => !!s.typing[id]);
  const unread = useApp((s) => s.conversations.find((c) => c.id === id)?.unread[meId] ?? 0);
  const setActive = useApp((s) => s.setActiveConversation);
  const send = useApp((s) => s.sendMessage);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setActive(id);
    inputRef.current?.focus();
    return () => setActive(null);
  }, [id, setActive]);
  useEffect(() => {
    if (unread) setActive(id);
  }, [unread, id, setActive]);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conv?.messages.length, typing, id]);

  if (!conv) return <Navigate to="/mensajes" replace />;
  const iAmOwner = post?.ownerId === meId;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    send(conv.id, t);
    setText("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-line px-3 py-3 sm:px-5">
        <button onClick={() => nav("/mensajes")} className="grid h-11 w-11 place-items-center rounded-xl text-ink hover:bg-surface-alt md:hidden" aria-label="Volver a conversaciones"><ArrowLeft size={20} /></button>
        <Avatar name={other?.name ?? "?"} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink">{other?.name}</p>
          <p className={cn("text-xs font-medium", typing ? "text-success-strong" : "text-ink-subtle")}>{typing ? "escribiendo…" : iAmOwner ? "Interesado en tu publicación" : "Autor de la publicación"}</p>
        </div>
        {post && (
          <button onClick={() => nav(`/publicacion/${post.id}`)} className="hidden max-w-[280px] items-center gap-2.5 rounded-xl border border-line p-1.5 pr-3 text-left hover:bg-surface-alt sm:flex">
            <img src={photoSrc(post.photos[0])} alt="" className="h-10 w-10 rounded-lg object-cover" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-ink">{postTitle(post)}</span>
              <span className="block truncate text-xs text-ink-muted">{post.zone}</span>
            </span>
            <StatusBadge post={post} />
          </button>
        )}
      </div>
      {post && (
        <button onClick={() => nav(`/publicacion/${post.id}`)} className="flex items-center gap-2.5 border-b border-line bg-surface-alt px-4 py-2 text-left sm:hidden">
          <img src={photoSrc(post.photos[0])} alt="" className="h-8 w-8 rounded-lg object-cover" />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">Sobre: {postTitle(post)} · {post.zone}</span>
          <StatusBadge post={post} />
        </button>
      )}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-bg px-4 py-5 sm:px-6" aria-live="polite">
        <div className="flex flex-col gap-2">
          {conv.messages.length === 0 && (
            <p className="mx-auto mt-10 max-w-[34ch] text-center text-sm text-ink-muted">
              Cuéntale dónde y cuándo viste a la mascota. Un mensaje claro ayuda mucho.
            </p>
          )}
          {conv.messages.map((m) => {
            const mine = m.senderId === meId;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[78%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug shadow-sm animate-fade-up md:max-w-[62%]", mine ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-surface text-ink")}>
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={cn("mt-1 text-right text-[11px] tabular-nums", mine ? "text-white/75" : "text-ink-subtle")}>{clockTime(m.at)}</p>
                </div>
              </div>
            );
          })}
          {typing && (
            <div className="flex">
              <div className="flex gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-3.5 shadow-sm" aria-label="Escribiendo">
                {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-ink-subtle" style={{ animationDelay: `${i * 120}ms` }} />)}
              </div>
            </div>
          )}
        </div>
      </div>
      <form onSubmit={submit} className="flex items-end gap-2 border-t border-line bg-surface p-3 sm:px-5">
        <label htmlFor="chat-input" className="sr-only">Escribe un mensaje</label>
        <textarea
          ref={inputRef}
          id="chat-input"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(e);
            }
          }}
          placeholder="Escribe un mensaje… (Enter para enviar)"
          className="max-h-32 min-h-[48px] flex-1 resize-none rounded-xl border border-line bg-bg px-4 py-3 text-[15px] text-ink placeholder:text-ink-subtle focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
        />
        <Button type="submit" disabled={!text.trim()} className="h-12 px-4" aria-label="Enviar mensaje">
          <SendHorizontal /> <span className="hidden sm:inline">Enviar</span>
        </Button>
      </form>
    </div>
  );
}

export default function Messages() {
  const { id } = useParams();
  const nav = useNavigate();
  const meId = useApp((s) => s.sessionUserId);
  const valid = useApp((s) => !!id && s.conversations.some((c) => c.id === id && !!s.sessionUserId && c.participants.includes(s.sessionUserId)));

  if (!meId)
    return (
      <Container>
        <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-line bg-surface">
          <EmptyState icon={<LogIn />} title="Inicia sesión para ver tus mensajes" action={<Button onClick={() => nav("/bienvenida", { state: { from: "/mensajes" } })}>Ingresar</Button>}>
            Aquí llegan los mensajes de vecinos que vieron tu mascota.
          </EmptyState>
        </div>
      </Container>
    );
  if (id && !valid) return <Navigate to="/mensajes" replace />;

  return (
    <Container className="py-6">
      <h1 className="sr-only">Mensajes</h1>
      <div className="grid h-[calc(100dvh-64px-48px)] min-h-[520px] overflow-hidden rounded-2xl border border-line bg-surface shadow-soft md:grid-cols-[340px_1fr]">
        <div className={cn("min-h-0 flex-col border-line md:flex md:border-r", id ? "hidden" : "flex")}>
          <div className="flex h-[69px] shrink-0 items-center border-b border-line px-5">
            <h2 className="text-lg font-extrabold text-ink">Mensajes</h2>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationList activeId={id} />
          </div>
        </div>
        <div className={cn("min-h-0", id ? "block" : "hidden md:block")}>
          {id ? (
            <ChatPane key={id} id={id} />
          ) : (
            <div className="grid h-full place-items-center bg-bg">
              <EmptyState icon={<MessagesSquare />} title="Elige una conversación">Cada chat muestra la publicación que lo originó, para que sepas de qué mascota hablan.</EmptyState>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
