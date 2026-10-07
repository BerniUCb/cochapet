import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Camera, Cat, Dog, ImagePlus, PawPrint, Search, HeartHandshake, X } from "lucide-react";
import { BackLink, Container, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useApp, useMe } from "@/store/useApp";
import { ZONES } from "@/lib/constants";
import { PHONE_RE, cn, compressImage, fakeDelay, todayISO } from "@/lib/utils";
import type { PostType, Species } from "@/lib/types";

const STEPS = ["Tipo", "Descripción", "Fotos", "Lugar y contacto"];
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export default function Publish() {
  const me = useMe();
  const createPost = useApp((s) => s.createPost);
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [f, setF] = useState({
    type: "" as PostType | "",
    species: "" as Species | "",
    description: "",
    name: "",
    breed: "",
    color: "",
    photos: [] as string[],
    zone: "",
    reference: "",
    date: todayISO(),
    contactPhone: me?.phone ?? "",
  });

  if (!me) return <Navigate to="/bienvenida" replace state={{ from: "/publicar" }} />;

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    setF((s) => ({ ...s, [k]: v }));
    if (err[k as string]) setErr((e) => ({ ...e, [k]: "" }));
  };

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0 && !f.type) e.type = "Elige si perdiste o encontraste una mascota.";
    if (s === 1) {
      if (!f.species) e.species = "Elige la especie.";
      if (f.description.trim().length < 15) e.description = "Describe a la mascota y sus rasgos (mínimo 15 caracteres).";
    }
    if (s === 2 && f.photos.length === 0) e.photos = "Agrega al menos una foto para continuar.";
    if (s === 3) {
      if (!f.zone) e.zone = "Elige la zona o barrio.";
      if (f.reference.trim().length < 5) e.reference = "Escribe una referencia del lugar (calle, plaza, mercado…).";
      if (!f.date) e.date = "Indica la fecha.";
      else if (f.date > todayISO()) e.date = "La fecha no puede ser futura.";
      const ph = f.contactPhone.replace(/\s/g, "");
      if (!PHONE_RE.test(ph)) e.contactPhone = "Usa un celular de 8 dígitos que empiece con 6 o 7.";
    }
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (!validate(step)) return;
    if (step < 3) return setStep(step + 1);
    setBusy(true);
    await fakeDelay();
    const post = createPost({
      type: f.type as PostType,
      species: f.species as Species,
      description: f.description.trim(),
      name: f.name.trim() || undefined,
      breed: f.breed.trim() || undefined,
      color: f.color.trim() || undefined,
      photos: f.photos,
      zone: f.zone,
      reference: f.reference.trim(),
      date: f.date,
      contactPhone: f.contactPhone.replace(/\s/g, ""),
    });
    setBusy(false);
    toast.success("¡Publicación creada! Ya es visible para todos.");
    nav(`/publicacion/${post.id}`, { replace: true, state: { justPublished: true } });
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = 4 - f.photos.length;
    const list = Array.from(files);
    const bad = list.filter((x) => !ACCEPT.includes(x.type));
    if (bad.length) toast.error("Solo se aceptan fotos JPG, PNG o WEBP.");
    const good = list.filter((x) => ACCEPT.includes(x.type));
    if (good.length > room) toast.warning(`Puedes subir hasta 4 fotos. Se agregaron ${room}.`);
    try {
      const data = await Promise.all(good.slice(0, room).map((x) => compressImage(x)));
      set("photos", [...f.photos, ...data]);
    } catch {
      toast.error("No pudimos leer una de las fotos. Prueba con otra imagen.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const back = () => (step > 0 ? setStep(step - 1) : setLeaving(true));
  const lost = f.type === "perdida";

  return (
    <Container className="max-w-[1080px]">
      <PageHeader
        back={<BackLink label="Cancelar" onClick={() => setLeaving(true)} />}
        eyebrow={`Paso ${step + 1} de 4`}
        title="Publicar mascota"
        subtitle="Tu publicación será visible para todos apenas la completes. Los campos marcados como opcionales puedes dejarlos vacíos."
      />
      <div className="grid gap-6 lg:grid-cols-[230px_1fr] lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex gap-1.5 lg:hidden" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1} aria-label={`Paso ${step + 1} de 4: ${STEPS[step]}`}>
            {STEPS.map((s, i) => (
              <span key={s} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-line")} />
            ))}
          </div>
          <ol className="hidden flex-col gap-1 lg:flex" aria-label="Pasos">
            {STEPS.map((s, i) => (
              <li key={s} aria-current={i === step ? "step" : undefined} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold", i === step ? "bg-surface text-ink shadow-soft" : i < step ? "text-ink" : "text-ink-subtle")}>
                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs font-bold", i < step ? "border-primary bg-primary text-white" : i === step ? "border-primary text-primary" : "border-line")}>
                  {i < step ? <Check size={14} strokeWidth={3} /> : i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </aside>

        <div className="min-w-0 rounded-2xl bg-surface p-5 shadow-soft sm:p-8">
      <div className="animate-fade-up" key={step}>
        {step === 0 && (
          <fieldset>
            <legend className="text-xl font-extrabold text-ink">¿Qué pasó?</legend>
            <p className="mt-1 text-sm text-ink-muted">Así sabremos cómo mostrar tu publicación.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { id: "perdida" as const, title: "Perdí mi mascota", sub: "Quiero que me ayuden a encontrarla", icon: <Search /> },
                { id: "encontrada" as const, title: "Encontré una mascota", sub: "Quiero que su familia la ubique", icon: <HeartHandshake /> },
              ].map((o) => (
                <label key={o.id} className={cn("flex cursor-pointer items-center gap-4 rounded-2xl border-2 bg-surface p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary", f.type === o.id ? "border-primary bg-primary-soft/40" : "border-transparent shadow-soft")}>
                  <input type="radio" name="tipo" value={o.id} checked={f.type === o.id} onChange={() => set("type", o.id)} className="sr-only" />
                  <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl [&_svg]:size-6", o.id === "perdida" ? "bg-primary text-white" : "bg-success-soft text-success-strong")}>{o.icon}</span>
                  <span>
                    <span className="block text-base font-bold text-ink">{o.title}</span>
                    <span className="block text-sm text-ink-muted">{o.sub}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-3"><FieldError>{err.type}</FieldError></div>
          </fieldset>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-ink">Describe a la mascota</h2>
              <p className="mt-1 text-sm text-ink-muted">Los rasgos únicos ayudan a reconocerla rápido.</p>
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold text-ink">Especie</legend>
              <div className="grid grid-cols-3 gap-2">
                {([["Perro", <Dog key="d" />], ["Gato", <Cat key="c" />], ["Otro", <PawPrint key="o" />]] as const).map(([s, icon]) => (
                  <label key={s} className={cn("flex h-[72px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 bg-surface text-sm font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary [&_svg]:size-6", f.species === s ? "border-primary text-primary" : "border-line text-ink-muted")}>
                    <input type="radio" name="especie" value={s} checked={f.species === s} onChange={() => set("species", s)} className="sr-only" />
                    {icon}
                    {s}
                  </label>
                ))}
              </div>
              <FieldError>{err.species}</FieldError>
            </fieldset>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pub-desc">Descripción y rasgos</Label>
              <Textarea id="pub-desc" value={f.description} onChange={(e) => set("description", e.target.value)} aria-invalid={!!err.description} maxLength={600}
                placeholder={lost ? "Ej. Macho de 3 años, collar azul, mancha blanca en el pecho. Se asusta con ruidos fuertes." : "Ej. Hembra pequeña, muy mansa, sin collar. Tiene una cicatriz en la oreja izquierda."} />
              <div className="flex justify-between gap-2"><FieldError>{err.description}</FieldError><span className="ml-auto text-xs tabular-nums text-ink-subtle">{f.description.length}/600</span></div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pub-name" optional>Nombre</Label>
              <Input id="pub-name" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder={lost ? "Ej. Toby" : "Si tiene placa con nombre"} maxLength={40} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="pub-breed" optional>Raza</Label>
                <Input id="pub-breed" value={f.breed} onChange={(e) => set("breed", e.target.value)} placeholder="Ej. Mestizo" maxLength={40} />
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="pub-color" optional>Color</Label>
                <Input id="pub-color" value={f.color} onChange={(e) => set("color", e.target.value)} placeholder="Ej. Café" maxLength={40} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-ink">Agrega fotos</h2>
              <p className="mt-1 text-sm text-ink-muted">Mínimo 1 y máximo 4. Fotos claras de cara y cuerpo funcionan mejor.</p>
            </div>
            <input ref={fileRef} id="pub-photos" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {f.photos.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-2xl bg-surface-alt">
                  <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute bottom-2 left-2 rounded-full bg-[#111C2D]/75 px-2 py-1 text-[11px] font-semibold text-white">Principal</span>}
                  <button onClick={() => set("photos", f.photos.filter((_, j) => j !== i))} className="absolute right-1.5 top-1.5 grid h-11 w-11 place-items-center rounded-full text-white" aria-label={`Quitar foto ${i + 1}`}>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#111C2D]/70"><X size={16} /></span>
                  </button>
                </div>
              ))}
              {f.photos.length < 4 && (
                <label htmlFor="pub-photos" className={cn("flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-surface text-center text-sm font-semibold hover:bg-surface-alt", err.photos ? "border-error text-error" : "border-[#C9D1E4] text-ink-muted")}>
                  {f.photos.length ? <ImagePlus size={28} aria-hidden /> : <Camera size={28} aria-hidden />}
                  {f.photos.length ? "Agregar otra" : "Subir fotos"}
                  <span className="text-xs font-normal text-ink-subtle">JPG, PNG o WEBP</span>
                </label>
              )}
            </div>
            <p className="text-xs tabular-nums text-ink-subtle">{f.photos.length} de 4 fotos</p>
            {f.photos.length === 0 && <p className="text-[13px] font-medium text-ink-muted">Agrega al menos una foto para continuar.</p>}
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <h2 className="text-xl font-extrabold text-ink">{lost ? "¿Dónde y cuándo se perdió?" : "¿Dónde y cuándo la encontraste?"}</h2>
              <p className="mt-1 text-sm text-ink-muted">Así la verán los vecinos de esa zona.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pub-zone">Zona o barrio</Label>
              <Select id="pub-zone" value={f.zone} onChange={(e) => set("zone", e.target.value)} aria-invalid={!!err.zone}>
                <option value="">Elige una zona…</option>
                {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
              </Select>
              <FieldError>{err.zone}</FieldError>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="pub-ref">Referencia del lugar</Label>
              <Input id="pub-ref" value={f.reference} onChange={(e) => set("reference", e.target.value)} aria-invalid={!!err.reference} placeholder="Ej. A media cuadra del mercado, calle Antezana" maxLength={120} />
              <FieldError>{err.reference}</FieldError>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pub-date">{lost ? "Fecha en que se perdió" : "Fecha del hallazgo"}</Label>
              <Input id="pub-date" type="date" value={f.date} max={todayISO()} onChange={(e) => set("date", e.target.value)} aria-invalid={!!err.date} />
              <FieldError>{err.date}</FieldError>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pub-phone">Teléfono o WhatsApp de contacto</Label>
              <div className="flex gap-2">
                <span className="grid h-12 place-items-center rounded-xl border border-line bg-surface-alt px-3 text-[15px] font-semibold text-ink-muted">+591</span>
                <Input id="pub-phone" type="tel" inputMode="numeric" value={f.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} aria-invalid={!!err.contactPhone} placeholder="71234567" maxLength={9} />
              </div>
              <p className="text-xs text-ink-subtle">{me.phone ? "Usamos el teléfono de tu perfil. Puedes cambiarlo solo para esta publicación." : "Tu perfil aún no tiene teléfono. Escribe uno para esta publicación."}</p>
              <FieldError>{err.contactPhone}</FieldError>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
        {step > 0 ? <Button variant="outline" onClick={back} disabled={busy}><ArrowLeft /> Atrás</Button> : <span />}
        <Button className="min-w-[160px]" onClick={next} loading={busy} disabled={step === 2 && f.photos.length === 0}>
          {step === 3 ? "Publicar ahora" : <>Continuar <ArrowRight /></>}
        </Button>
      </div>
        </div>
      </div>

      <Dialog open={leaving} onOpenChange={setLeaving}>
        <DialogContent>
          <DialogTitle>¿Salir sin publicar?</DialogTitle>
          <DialogDescription>Perderás los datos que llenaste en este formulario.</DialogDescription>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setLeaving(false)}>Seguir aquí</Button>
            <Button variant="destructive" className="flex-1" onClick={() => nav("/", { replace: true })}>Salir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
