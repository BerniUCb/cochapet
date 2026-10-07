import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { toast } from "sonner";
import type { Conversation, PlanId, Post, Promotion, PromoStatus, User } from "@/lib/types";
import { buildSeed } from "@/seed/data";
import { uid } from "@/lib/utils";
import { planById, QR_MINUTES } from "@/lib/constants";

let warnedQuota = false;
const memory: Record<string, string> = {};
const safeStorage: StateStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return memory[k] ?? null;
    }
  },
  setItem: (k, v) => {
    memory[k] = v;
    try {
      localStorage.setItem(k, v);
    } catch {
      if (!warnedQuota) {
        warnedQuota = true;
        toast.warning("Este navegador no pudo guardar todos los datos de la demo. Seguirán disponibles hasta que recargues.");
      }
    }
  },
  removeItem: (k) => {
    delete memory[k];
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};

const AUTO_REPLIES_TO_OWNER = [
  "¡Hola! Creo que la vi hace un rato, ¿todavía la están buscando?",
  "Estaba cerca de una tienda de barrio, le di un poco de agua. Te paso más detalles si quieres.",
  "Voy a estar atento por la zona y te aviso cualquier cosa.",
];
const AUTO_REPLIES_FROM_OWNER = [
  "¡Muchas gracias por escribir! ¿Dónde la viste exactamente?",
  "¿Recuerdas a qué hora fue? Así voy a buscar por ahí.",
  "Te dejo mi número en la publicación por si es más rápido. ¡Gracias de verdad!",
];

interface Data {
  users: User[];
  posts: Post[];
  promotions: Promotion[];
  conversations: Conversation[];
  sessionUserId: string | null;
}

interface State extends Data {
  activeConversationId: string | null;
  typing: Record<string, boolean>;
  // auth
  registerUser: (u: { name: string; email: string; phone: string; provider: User["provider"] }) => { ok: true; user: User } | { ok: false; error: string };
  googleSignIn: (acc: { name: string; email: string }) => { user: User; created: boolean };
  loginAs: (userId: string) => void;
  logout: () => void;
  // posts
  createPost: (p: Omit<Post, "id" | "createdAt" | "resolved" | "ownerId">) => Post;
  resolvePost: (postId: string) => void;
  // chat
  openConversation: (postId: string) => string;
  setActiveConversation: (id: string | null) => void;
  sendMessage: (convId: string, text: string) => void;
  // promotions
  requestPromotion: (postId: string, plan: PlanId) => Promotion;
  confirmPayment: (promoId: string) => void;
  failPayment: (promoId: string, reason: string) => void;
  renewQr: (promoId: string) => void;
  cancelPromotion: (promoId: string) => void;
  setPromotionStatus: (promoId: string, status: PromoStatus) => void;
  resetDemo: () => void;
}

const seed = () => {
  const s = buildSeed();
  return { ...s, sessionUserId: null as string | null };
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      ...seed(),
      activeConversationId: null,
      typing: {},

      registerUser: ({ name, email, phone, provider }) => {
        const exists = get().users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (exists) return { ok: false, error: "Ya existe una cuenta con este correo. Usa otro o entra con Google." };
        const user: User = { id: uid("u"), name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), role: "user", provider, createdAt: Date.now() };
        set((s) => ({ users: [...s.users, user], sessionUserId: user.id }));
        return { ok: true, user };
      },
      googleSignIn: (acc) => {
        const existing = get().users.find((u) => u.email.toLowerCase() === acc.email.toLowerCase());
        if (existing) {
          set({ sessionUserId: existing.id });
          return { user: existing, created: false };
        }
        const user: User = { id: uid("u"), name: acc.name, email: acc.email, phone: "", role: "user", provider: "google", createdAt: Date.now() };
        set((s) => ({ users: [...s.users, user], sessionUserId: user.id }));
        return { user, created: true };
      },
      loginAs: (userId) => set({ sessionUserId: userId }),
      logout: () => set({ sessionUserId: null, activeConversationId: null }),

      createPost: (p) => {
        const me = get().sessionUserId!;
        const post: Post = { ...p, id: uid("p"), ownerId: me, resolved: false, createdAt: Date.now() };
        set((s) => ({ posts: [post, ...s.posts] }));
        return post;
      },
      resolvePost: (postId) =>
        set((s) => ({ posts: s.posts.map((p) => (p.id === postId ? { ...p, resolved: true, resolvedAt: Date.now() } : p)) })),

      openConversation: (postId) => {
        const me = get().sessionUserId!;
        const post = get().posts.find((p) => p.id === postId)!;
        const found = get().conversations.find((c) => c.postId === postId && c.participants.includes(me) && c.participants.includes(post.ownerId));
        if (found) return found.id;
        const conv: Conversation = { id: uid("c"), postId, participants: [me, post.ownerId], messages: [], unread: { [me]: 0, [post.ownerId]: 0 }, updatedAt: Date.now() };
        set((s) => ({ conversations: [conv, ...s.conversations] }));
        return conv.id;
      },
      setActiveConversation: (id) =>
        set((s) => ({
          activeConversationId: id,
          conversations: id && s.sessionUserId
            ? s.conversations.map((c) => (c.id === id ? { ...c, unread: { ...c.unread, [s.sessionUserId!]: 0 } } : c))
            : s.conversations,
        })),
      sendMessage: (convId, text) => {
        const me = get().sessionUserId;
        if (!me) return;
        const now = Date.now();
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId ? { ...c, messages: [...c.messages, { id: uid("m"), senderId: me, text, at: now }], updatedAt: now } : c,
          ),
          typing: { ...s.typing, [convId]: true },
        }));
        setTimeout(() => {
          const st = get();
          const conv = st.conversations.find((c) => c.id === convId);
          if (!conv) return set((s) => ({ typing: { ...s.typing, [convId]: false } }));
          const other = conv.participants.find((p) => p !== me)!;
          const post = st.posts.find((p) => p.id === conv.postId);
          const otherIsOwner = post?.ownerId === other;
          const pool = otherIsOwner ? AUTO_REPLIES_FROM_OWNER : AUTO_REPLIES_TO_OWNER;
          const count = conv.messages.filter((m) => m.senderId === other).length;
          const reply = pool[count % pool.length];
          const viewing = st.activeConversationId === convId && st.sessionUserId === me;
          const at = Date.now();
          set((s) => ({
            typing: { ...s.typing, [convId]: false },
            conversations: s.conversations.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    messages: [...c.messages, { id: uid("m"), senderId: other, text: reply, at }],
                    updatedAt: at,
                    unread: { ...c.unread, [me]: viewing ? 0 : (c.unread[me] ?? 0) + 1 },
                  }
                : c,
            ),
          }));
        }, 2000);
      },

      requestPromotion: (postId, plan) => {
        const me = get().sessionUserId!;
        const now = Date.now();
        const promo: Promotion = {
          id: uid("pr"), postId, ownerId: me, plan, amount: planById(plan).price, status: "pendiente", createdAt: now,
          qrExpiresAt: now + QR_MINUTES * 60_000, qrRef: `CP-${Math.floor(10000 + Math.random() * 89999)}`,
        };
        set((s) => ({ promotions: [promo, ...s.promotions.filter((p) => !(p.postId === postId && p.status === "pendiente"))] }));
        return promo;
      },
      confirmPayment: (promoId) =>
        set((s) => ({ promotions: s.promotions.map((p) => (p.id === promoId ? { ...p, status: "pagada", paidAt: Date.now(), lastError: undefined } : p)) })),
      failPayment: (promoId, reason) =>
        set((s) => ({ promotions: s.promotions.map((p) => (p.id === promoId ? { ...p, lastError: reason } : p)) })),
      renewQr: (promoId) =>
        set((s) => ({
          promotions: s.promotions.map((p) =>
            p.id === promoId ? { ...p, qrExpiresAt: Date.now() + QR_MINUTES * 60_000, qrRef: `CP-${Math.floor(10000 + Math.random() * 89999)}`, lastError: undefined } : p,
          ),
        })),
      cancelPromotion: (promoId) => set((s) => ({ promotions: s.promotions.filter((p) => p.id !== promoId) })),
      setPromotionStatus: (promoId, status) =>
        set((s) => ({
          promotions: s.promotions.map((p) =>
            p.id === promoId
              ? { ...p, status, ...(status === "en_curso" ? { startedAt: Date.now() } : {}), ...(status === "finalizada" ? { finishedAt: Date.now() } : {}) }
              : p,
          ),
        })),
      resetDemo: () => {
        const keep = get().sessionUserId;
        const s = buildSeed();
        set({ ...s, sessionUserId: keep && s.users.some((u) => u.id === keep) ? keep : null, activeConversationId: null, typing: {} });
      },
    }),
    {
      name: "cochapet-demo-v1",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s): Data => ({ users: s.users, posts: s.posts, promotions: s.promotions, conversations: s.conversations, sessionUserId: s.sessionUserId }),
    },
  ),
);

// ---------- selectors / helpers ----------
export const useMe = () => useApp((s) => s.users.find((u) => u.id === s.sessionUserId) ?? null);

export function latestPromo(promos: Promotion[], postId: string) {
  return promos.filter((p) => p.postId === postId).sort((a, b) => b.createdAt - a.createdAt)[0];
}
export function isFeatured(promos: Promotion[], postId: string) {
  return promos.some((p) => p.postId === postId && p.status === "en_curso");
}
export function openPromo(promos: Promotion[], postId: string) {
  return promos.find((p) => p.postId === postId && p.status !== "finalizada");
}
export function sortForFeed(posts: Post[], promos: Promotion[]) {
  return posts
    .filter((p) => !p.resolved)
    .sort((a, b) => Number(isFeatured(promos, b.id)) - Number(isFeatured(promos, a.id)) || b.createdAt - a.createdAt);
}
export function useUnreadTotal() {
  return useApp((s) => (s.sessionUserId ? s.conversations.reduce((n, c) => n + (c.unread[s.sessionUserId!] ?? 0), 0) : 0));
}
export const postTitle = (p: Post) => p.name?.trim() || (p.species === "Otro" ? "Mascota" : p.species);
