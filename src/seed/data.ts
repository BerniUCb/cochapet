import type { Conversation, Post, Promotion, User } from "@/lib/types";
import { isoDaysAgo } from "@/lib/utils";
import { QR_MINUTES } from "@/lib/constants";

const H = 3600_000;

export function buildSeed(now = Date.now()) {
  const users: User[] = [
    { id: "u_maria", name: "María Montenegro", email: "maria.montenegro@gmail.com", phone: "71234567", role: "user", provider: "google", createdAt: now - 40 * 24 * H },
    { id: "u_admin", name: "Admin Patas", email: "admin@cochapet.bo", phone: "44251234", role: "admin", provider: "demo", createdAt: now - 90 * 24 * H },
    { id: "u_carlos", name: "Carlos Rojas", email: "carlos.rojas@gmail.com", phone: "76543210", role: "user", provider: "google", createdAt: now - 20 * 24 * H },
    { id: "u_daniela", name: "Daniela Vargas", email: "dani.vargas@gmail.com", phone: "70712345", role: "user", provider: "formulario", createdAt: now - 15 * 24 * H },
    { id: "u_jorge", name: "Jorge Quiroga", email: "jorge.quiroga@hotmail.com", phone: "67401122", role: "user", provider: "formulario", createdAt: now - 30 * 24 * H },
    { id: "u_ana", name: "Ana Sejas", email: "ana.sejas@gmail.com", phone: "79876543", role: "user", provider: "google", createdAt: now - 12 * 24 * H },
  ];

  const posts: Post[] = [
    {
      id: "p_luna", ownerId: "u_jorge", type: "perdida", resolved: false, species: "Perro", name: "Luna", breed: "Golden retriever", color: "Dorado",
      description: "Hembra de 4 años, muy mansa. Lleva collar rojo con placa sin teléfono. Se asusta con los cohetillos y salió corriendo la noche del sábado. Responde a su nombre y le encantan las galletas.",
      photos: ["seed:luna1", "seed:luna2"], zone: "Queru Queru", reference: "Calle Pasoskanki, cerca del parque Lincoln", date: isoDaysAgo(2), contactPhone: "67401122", createdAt: now - 46 * H,
    },
    {
      id: "p_rocky", ownerId: "u_daniela", type: "perdida", resolved: false, species: "Perro", name: "Rocky", breed: "Labrador", color: "Negro",
      description: "Macho de 6 años, negro entero con una mancha blanca pequeña en el pecho. Es tranquilo pero no se deja agarrar por extraños. Tiene un chip pero no collar.",
      photos: ["seed:rocky"], zone: "Cala Cala", reference: "Av. Melchor Pérez de Olguín, a dos cuadras de la plaza Cala Cala", date: isoDaysAgo(0), contactPhone: "70712345", createdAt: now - 3 * H,
    },
    {
      id: "p_atigrada", ownerId: "u_ana", type: "encontrada", resolved: false, species: "Gato", color: "Atigrado café",
      description: "Encontré esta gatita atigrada maullando en el garaje de mi edificio. Es muy cariñosa, parece de casa. Tiene ojos verdes y la punta de la cola más oscura. La tengo resguardada.",
      photos: ["seed:atigrada"], zone: "Recoleta", reference: "Calle Pantaleón Dalence, frente a la iglesia de La Recoleta", date: isoDaysAgo(1), contactPhone: "79876543", createdAt: now - 20 * H,
    },
    {
      id: "p_michi", ownerId: "u_carlos", type: "perdida", resolved: false, species: "Gato", name: "Michi", breed: "Siamés", color: "Crema con orejas oscuras",
      description: "Gato siamés macho, castrado, ojos azules. Se escapó por la ventana del segundo piso. Es tímido, probablemente esté escondido en algún jardín o techo cercano.",
      photos: ["seed:michi"], zone: "Tupuraya", reference: "Pasaje Los Ceibos, detrás del mercado Tupuraya", date: isoDaysAgo(4), contactPhone: "76543210", createdAt: now - 4 * 24 * H - 2 * H,
    },
    {
      id: "p_pug", ownerId: "u_daniela", type: "encontrada", resolved: false, species: "Perro", breed: "Pug", color: "Beige con cara negra",
      description: "Pug adulto encontrado jugando con una pelota en la jardinera de la avenida. Está bien cuidado y gordito, alguien lo debe estar buscando. Lo llevé a mi casa mientras aparece su familia.",
      photos: ["seed:pug"], zone: "Av. América", reference: "Av. América casi Pando, cerca de la rotonda", date: isoDaysAgo(1), contactPhone: "70712345", createdAt: now - 28 * H,
    },
    {
      id: "p_toby", ownerId: "u_maria", type: "perdida", resolved: false, species: "Perro", name: "Toby", breed: "Beagle", color: "Tricolor",
      description: "Beagle macho de 3 años, tricolor (café, negro y blanco). El día que se perdió llevaba un collar tejido azul. Es juguetón y se acerca a la gente. Lo extrañamos mucho.",
      photos: ["seed:toby"], zone: "Sacaba", reference: "Plaza principal de Sacaba, a media cuadra de la alcaldía", date: isoDaysAgo(3), contactPhone: "71234567", createdAt: now - 3 * 24 * H - 5 * H,
    },
    {
      id: "p_husky", ownerId: "u_ana", type: "encontrada", resolved: false, species: "Perro", breed: "Husky siberiano", color: "Gris y blanco",
      description: "Husky encontrado caminando solo por la carretera, cansado y con sed. Es dócil y obedece la orden 'sentado'. No tiene collar. Está en mi casa con agua y comida.",
      photos: ["seed:husky"], zone: "Quillacollo", reference: "Av. Blanco Galindo km 13, cerca del puente", date: isoDaysAgo(6), contactPhone: "79876543", createdAt: now - 6 * 24 * H,
    },
    {
      id: "p_mostaza", ownerId: "u_jorge", type: "perdida", resolved: false, species: "Gato", name: "Mostaza", breed: "Persa", color: "Naranja",
      description: "Gato persa naranja de pelo largo, 5 años. Es muy grande y peludo, tiene la cara chata. No está acostumbrado a la calle. Ofrecemos recompensa a quien lo encuentre.",
      photos: ["seed:mostaza"], zone: "Cala Cala", reference: "Calle Lucas Mendoza de la Tapia, cerca del colegio", date: isoDaysAgo(8), contactPhone: "67401122", createdAt: now - 8 * 24 * H,
    },
    {
      id: "p_bruno", ownerId: "u_carlos", type: "perdida", resolved: false, species: "Perro", name: "Bruno", breed: "Bóxer mestizo", color: "Café claro",
      description: "Macho de 5 años, muy tranquilo y dormilón. Se escapó la noche del viernes. Le encanta echarse en pisos fríos. No tiene collar.",
      photos: ["seed:bruno"], zone: "Queru Queru", reference: "Av. Santa Cruz, cerca de la plazuela Quintanilla", date: isoDaysAgo(1), contactPhone: "76543210", createdAt: now - 22 * H,
    },
    {
      id: "p_canelo", ownerId: "u_ana", type: "perdida", resolved: false, species: "Perro", name: "Canelo", breed: "Mestizo", color: "Caramelo",
      description: "Pequeño y muy juguetón, 3 años. Se para en dos patas cuando pide comida y ladea la cabeza cuando le hablan. Responde a su nombre.",
      photos: ["seed:canelo"], zone: "Sarco", reference: "Av. Circunvalación, cerca del mercado de Sarco", date: isoDaysAgo(0), contactPhone: "79876543", createdAt: now - 5 * H,
    },
    {
      id: "p_canela", ownerId: "u_maria", type: "perdida", resolved: true, resolvedAt: now - 9 * 24 * H, species: "Perro", name: "Canela", breed: "Chihuahua", color: "Crema",
      description: "Chihuahua hembra con chompa gris. Ya volvió a casa gracias a una vecina que la reconoció.",
      photos: ["seed:canela"], zone: "Tupuraya", reference: "Av. Tadeo Haenke", date: isoDaysAgo(12), contactPhone: "71234567", createdAt: now - 12 * 24 * H,
    },
  ];

  const promotions: Promotion[] = [
    { id: "pr_luna", postId: "p_luna", ownerId: "u_jorge", plan: "super", amount: 140, status: "en_curso", createdAt: now - 40 * H, qrExpiresAt: now - 40 * H + QR_MINUTES * 60_000, qrRef: "CP-58213", paidAt: now - 40 * H + 4 * 60_000, startedAt: now - 36 * H },
    { id: "pr_toby", postId: "p_toby", ownerId: "u_maria", plan: "rapido", amount: 70, status: "pagada", createdAt: now - 5 * H, qrExpiresAt: now - 5 * H + QR_MINUTES * 60_000, qrRef: "CP-60417", paidAt: now - 5 * H + 3 * 60_000 },
    { id: "pr_husky", postId: "p_husky", ownerId: "u_ana", plan: "rapido", amount: 70, status: "finalizada", createdAt: now - 6 * 24 * H, qrExpiresAt: now - 6 * 24 * H, qrRef: "CP-49980", paidAt: now - 6 * 24 * H, startedAt: now - 5.8 * 24 * H, finishedAt: now - 3.8 * 24 * H },
    { id: "pr_mostaza", postId: "p_mostaza", ownerId: "u_jorge", plan: "maxima", amount: 250, status: "pagada", createdAt: now - 2 * H, qrExpiresAt: now - 2 * H, qrRef: "CP-61002", paidAt: now - 2 * H + 2 * 60_000 },
  ];

  const conversations: Conversation[] = [
    {
      id: "c_toby_carlos", postId: "p_toby", participants: ["u_carlos", "u_maria"], updatedAt: now - 50 * 60_000,
      unread: { u_maria: 2, u_carlos: 0 },
      messages: [
        { id: "m1", senderId: "u_carlos", text: "Hola María, creo que vi a un beagle parecido a Toby por la plaza de Sacaba hoy en la mañana.", at: now - 55 * 60_000 },
        { id: "m2", senderId: "u_carlos", text: "Estaba cerca de los puestos de salteñas, tenía un collar azul. ¿Te mando ubicación?", at: now - 50 * 60_000 },
      ],
    },
    {
      id: "c_rocky_maria", postId: "p_rocky", participants: ["u_maria", "u_daniela"], updatedAt: now - 2 * H,
      unread: { u_maria: 0, u_daniela: 0 },
      messages: [
        { id: "m3", senderId: "u_maria", text: "Hola Daniela, ¿Rocky tiene alguna marca además de la mancha del pecho?", at: now - 2.5 * H },
        { id: "m4", senderId: "u_daniela", text: "Sí, tiene una oreja un poco caída. ¡Gracias por estar atenta!", at: now - 2 * H },
      ],
    },
  ];

  return { users, posts, promotions, conversations };
}

export const GOOGLE_DEMO_ACCOUNTS = [
  { name: "María Montenegro", email: "maria.montenegro@gmail.com" },
  { name: "Lucía Fernández", email: "lucia.fernandez.cbba@gmail.com" },
];
