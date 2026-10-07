export type Role = "user" | "admin";
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  provider: "google" | "formulario" | "demo";
  createdAt: number;
}
export type PostType = "perdida" | "encontrada";
export type Species = "Perro" | "Gato" | "Otro";
export interface Post {
  id: string;
  ownerId: string;
  type: PostType;
  resolved: boolean;
  species: Species;
  name?: string;
  breed?: string;
  color?: string;
  description: string;
  photos: string[];
  zone: string;
  reference: string;
  date: string;
  contactPhone: string;
  createdAt: number;
  resolvedAt?: number;
}
export type PlanId = "rapido" | "super" | "maxima";
export type PromoStatus = "pendiente" | "pagada" | "en_curso" | "finalizada";
export interface Promotion {
  id: string;
  postId: string;
  ownerId: string;
  plan: PlanId;
  amount: number;
  status: PromoStatus;
  createdAt: number;
  qrExpiresAt: number;
  qrRef: string;
  paidAt?: number;
  startedAt?: number;
  finishedAt?: number;
  lastError?: string;
}
export interface Message {
  id: string;
  senderId: string;
  text: string;
  at: number;
}
export interface Conversation {
  id: string;
  postId: string;
  participants: [string, string];
  messages: Message[];
  unread: Record<string, number>;
  updatedAt: number;
}
