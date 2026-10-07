import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { useApp } from "@/store/useApp";
import { EMAIL_RE, PHONE_RE, fakeDelay } from "@/lib/utils";
import { AuthLayout, useAfterLogin } from "./Welcome";
import { Link, useLocation } from "react-router-dom";

export default function Register() {
  const register = useApp((s) => s.registerUser);
  const after = useAfterLogin();
  const loc = useLocation();
  const [f, setF] = useState({ name: "", email: "", phone: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 3) e.name = "Escribe tu nombre completo (mínimo 3 letras).";
    if (!f.email.trim()) e.email = "Escribe tu correo electrónico.";
    else if (!EMAIL_RE.test(f.email.trim())) e.email = "El correo no tiene un formato válido. Ejemplo: nombre@gmail.com";
    const ph = f.phone.replace(/\s/g, "");
    if (!ph) e.phone = "Escribe tu número de celular.";
    else if (!PHONE_RE.test(ph)) e.phone = "Usa un celular boliviano de 8 dígitos que empiece con 6 o 7.";
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    await fakeDelay();
    const r = register({ name: f.name, email: f.email, phone: f.phone.replace(/\s/g, ""), provider: "formulario" });
    setBusy(false);
    if (!r.ok) {
      setErr({ email: r.error });
      return;
    }
    toast.success(`Cuenta creada. ¡Bienvenido/a, ${r.user.name.split(" ")[0]}!`);
    after("/");
  };

  const field = (k: keyof typeof f) => ({
    id: `reg-${k}`,
    value: f[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setF({ ...f, [k]: e.target.value });
      if (err[k]) setErr({ ...err, [k]: "" });
    },
    "aria-invalid": !!err[k],
    "aria-describedby": err[k] ? `reg-${k}-err` : undefined,
  });

  return (
    <AuthLayout>
      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-ink">Crea tu cuenta</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">Con tu cuenta puedes publicar mascotas, escribir a otros vecinos y promocionar tus publicaciones.</p>
      <form onSubmit={submit} noValidate className="mt-7 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="reg-name">Nombre completo</Label>
          <Input {...field("name")} autoComplete="name" placeholder="Ej. Ana Pérez" />
          <FieldError id="reg-name-err">{err.name}</FieldError>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="reg-email">Correo electrónico</Label>
          <Input {...field("email")} type="email" inputMode="email" autoComplete="email" placeholder="nombre@gmail.com" />
          <FieldError id="reg-email-err">{err.email}</FieldError>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="reg-phone">Celular / WhatsApp</Label>
          <div className="flex gap-2">
            <span className="grid h-12 place-items-center rounded-xl border border-line bg-surface-alt px-3 text-[15px] font-semibold text-ink-muted">+591</span>
            <Input {...field("phone")} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="71234567" maxLength={9} />
          </div>
          <FieldError id="reg-phone-err">{err.phone}</FieldError>
        </div>
        <Button type="submit" size="lg" loading={busy} className="mt-2">
          Crear cuenta
        </Button>
        <p className="text-center text-sm text-ink-muted">¿Ya tienes cuenta? <Link to="/bienvenida" state={loc.state} className="font-semibold text-primary hover:underline">Ingresa con Google</Link></p>
        <p className="text-center text-xs text-ink-subtle">Demo: prueba con maria.montenegro@gmail.com para ver la validación de correo repetido.</p>
      </form>
    </AuthLayout>
  );
}
