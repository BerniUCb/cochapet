import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SEED_PHOTOS } from "@/seed/photos";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const fakeDelay = () => sleep(300 + Math.round(Math.random() * 500));

export const uid = (p = "id") => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function photoSrc(ref: string) {
  if (ref.startsWith("seed:")) return SEED_PHOTOS[ref.slice(5)] ?? "";
  return ref;
}

export function relativeTime(ts: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return "hace un momento";
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "ayer";
  if (d < 7) return `hace ${d} días`;
  const w = Math.round(d / 7);
  if (w < 5) return w === 1 ? "hace 1 semana" : `hace ${w} semanas`;
  return new Date(ts).toLocaleDateString("es-BO", { day: "numeric", month: "short" });
}

export function clockTime(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString())
    return d.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", hour12: false });
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-BO", { day: "numeric", month: "short" });
}

export function longDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" });
}

export function todayISO() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function isoDaysAgo(n: number) {
  const d = new Date(Date.now() - n * 86400000);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const formatBs = (n: number, decimals = false) =>
  `Bs.\u00a0${decimals ? n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : n.toLocaleString("es-BO")}`;

export function formatPhone(p: string) {
  const d = p.replace(/\D/g, "");
  if (d.length === 8) return `+591 ${d.slice(0, 4)} ${d.slice(4)}`;
  return p;
}

export const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^[67]\d{7}$/;

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

export async function compressImage(file: File, max = 1000, quality = 0.78): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("No se pudo leer la imagen"));
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
