import type { PlanId, PromoStatus } from "./types";

export const ZONES = [
  "Cala Cala", "Recoleta", "Queru Queru", "Tupuraya", "Av. América", "Sacaba", "Quillacollo",
  "Centro (Plaza 14 de Septiembre)", "El Prado", "Sarco", "Hipódromo", "Muyurina", "Las Cuadras",
  "Mayorazgo", "Temporal", "Pacata", "Villa Busch", "Jaihuayco", "La Cancha", "Lacma", "Condebamba", "Tiquipaya", "Colcapirhua",
];

export const PLANS: { id: PlanId; name: string; price: number; duration: string; reach: string; detail: string; recommended?: boolean }[] = [
  { id: "rapido", name: "Rápido Barrio", price: 70, duration: "48 horas", reach: "Facebook + Instagram", detail: "Anuncio dirigido a tu barrio y zonas vecinas." },
  { id: "super", name: "Super Cobertura", price: 140, duration: "5 días", reach: "Mayor alcance", detail: "Facebook + Instagram en tu zona y toda la ciudad de Cochabamba.", recommended: true },
  { id: "maxima", name: "Alerta Máxima", price: 250, duration: "7 días", reach: "Todo el eje metropolitano", detail: "De Sacaba a Sipe Sipe: Cercado, Quillacollo, Tiquipaya, Colcapirhua y Vinto." },
];
export const planById = (id: PlanId) => PLANS.find((p) => p.id === id)!;

export const PROMO_STEPS: { id: PromoStatus; label: string }[] = [
  { id: "pendiente", label: "Pendiente de pago" },
  { id: "pagada", label: "Pagada" },
  { id: "en_curso", label: "En curso" },
  { id: "finalizada", label: "Finalizada" },
];
export const promoLabel = (s: PromoStatus) => PROMO_STEPS.find((x) => x.id === s)!.label;

export const QR_MINUTES = 10;
