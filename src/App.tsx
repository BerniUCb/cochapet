import { useEffect, useState } from "react";
import { MemoryRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LayoutDashboard, LogIn, LogOut, Menu, MessageCircle, Plus, Search, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp, useMe, useUnreadTotal } from "@/store/useApp";
import { useRequireAuth } from "@/lib/auth";
import { Avatar, Container, Logo, Wordmark } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import Welcome from "@/screens/Welcome";
import Register from "@/screens/Register";
import Feed from "@/screens/Feed";
import SearchScreen from "@/screens/Search";
import Publish from "@/screens/Publish";
import Detail from "@/screens/Detail";
import Messages from "@/screens/Messages";
import Promote from "@/screens/Promote";
import Payment from "@/screens/Payment";
import Profile from "@/screens/Profile";
import Admin from "@/screens/Admin";

const AUTH_ROUTES = [/^\/bienvenida/, /^\/registro/];

function UnreadBadge({ n, className }: { n: number; className?: string }) {
  if (!n) return null;
  return (
    <span className={cn("grid h-[18px] min-w-[18px] place-items-center rounded-full bg-error px-1 text-[10.5px] font-bold leading-none text-white", className)}>
      {n > 9 ? "9+" : n}
    </span>
  );
}

function Header() {
  const me = useMe();
  const nav = useNavigate();
  const unread = useUnreadTotal();
  const requireAuth = useRequireAuth();
  const logout = useApp((s) => s.logout);
  const [menu, setMenu] = useState(false);
  const loc = useLocation();
  useEffect(() => setMenu(false), [loc.pathname]);

  const publish = () => requireAuth(() => nav("/publicar"), { returnTo: "/publicar", reason: "Inicia sesión para publicar una mascota" });
  const doLogout = () => {
    logout();
    toast("Cerraste sesión");
    nav("/", { replace: true });
  };
  const link = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative inline-flex h-11 items-center gap-1.5 rounded-xl px-3.5 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      isActive ? "text-primary" : "text-ink-muted hover:bg-surface-alt hover:text-ink",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <Container className="flex h-16 items-center gap-2">
        <NavLink to="/" className="mr-2 flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Cocha Pet, inicio">
          <Logo size={34} />
          <Wordmark className="text-[19px]" />
        </NavLink>
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Principal">
          <NavLink to="/" end className={link}>Inicio</NavLink>
          <NavLink to="/buscar" className={link}>Buscar</NavLink>
          <NavLink to="/mensajes" className={link} aria-label={unread ? `Mensajes, ${unread} sin leer` : undefined}>
            Mensajes <UnreadBadge n={unread} />
          </NavLink>
          {me?.role === "admin" && <NavLink to="/admin" className={link}>Panel admin</NavLink>}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Button onClick={publish} size="sm" className="h-11">
            <Plus strokeWidth={2.6} /> <span className="hidden sm:inline">Publicar mascota</span><span className="sm:hidden">Publicar</span>
          </Button>
          {me ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="hidden h-11 items-center gap-2 rounded-xl pl-1.5 pr-2 hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:flex" aria-label="Menú de tu cuenta">
                <Avatar name={me.name} size={32} />
                <span className="max-w-[120px] truncate text-sm font-semibold text-ink">{me.name.split(" ")[0]}</span>
                <ChevronDown size={16} className="text-ink-subtle" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={8} className="z-50 min-w-[240px] rounded-2xl border border-line bg-surface p-1.5 shadow-lift">
                  <div className="px-3 pb-2 pt-2">
                    <p className="truncate text-sm font-bold text-ink">{me.name}</p>
                    <p className="truncate text-xs text-ink-muted">{me.email}</p>
                  </div>
                  <DropdownMenu.Separator className="my-1 h-px bg-line" />
                  {[
                    { to: "/perfil", label: "Mi perfil y publicaciones", icon: <UserIcon size={16} /> },
                    ...(me.role === "admin" ? [{ to: "/admin", label: "Panel de administrador", icon: <LayoutDashboard size={16} /> }] : []),
                  ].map((i) => (
                    <DropdownMenu.Item key={i.to} onSelect={() => nav(i.to)} className="flex h-11 cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-ink outline-none data-[highlighted]:bg-surface-alt">
                      {i.icon} {i.label}
                    </DropdownMenu.Item>
                  ))}
                  <DropdownMenu.Item onSelect={doLogout} className="flex h-11 cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-ink outline-none data-[highlighted]:bg-surface-alt">
                    <LogOut size={16} /> Cerrar sesión
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <div className="hidden items-center gap-1.5 md:flex">
              <Button variant="ghost" size="sm" className="h-11" onClick={() => nav("/bienvenida", { state: { from: loc.pathname } })}>Ingresar</Button>
              <Button variant="outline" size="sm" className="h-11" onClick={() => nav("/registro", { state: { from: loc.pathname } })}>Crear cuenta</Button>
            </div>
          )}
          <button
            onClick={() => nav("/mensajes")}
            className="relative grid h-11 w-11 place-items-center rounded-xl text-ink hover:bg-surface-alt md:hidden"
            aria-label={unread ? `Mensajes, ${unread} sin leer` : "Mensajes"}
          >
            <MessageCircle size={21} />
            <UnreadBadge n={unread} className="absolute right-1 top-1 ring-2 ring-surface" />
          </button>
          <button onClick={() => setMenu(true)} className="grid h-11 w-11 place-items-center rounded-xl text-ink hover:bg-surface-alt md:hidden" aria-label="Abrir menú">
            <Menu size={22} />
          </button>
        </div>
      </Container>

      <Dialog open={menu} onOpenChange={setMenu}>
        <DialogContent className="left-auto right-0 top-0 h-full max-h-none w-[min(320px,86vw)] translate-x-0 translate-y-0 rounded-none rounded-l-2xl p-5">
          <DialogTitle className="sr-only">Menú</DialogTitle>
          <DialogDescription className="sr-only">Navegación del sitio</DialogDescription>
          <div className="flex items-center gap-2.5 pr-10">
            <Logo size={30} />
            <Wordmark className="text-lg" />
          </div>
          {me && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-surface-alt p-3">
              <Avatar name={me.name} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{me.name}</p>
                <p className="truncate text-xs text-ink-muted">{me.email}</p>
              </div>
            </div>
          )}
          <nav className="mt-4 flex flex-col gap-1" aria-label="Menú móvil">
            {[
              { to: "/", label: "Inicio", end: true },
              { to: "/buscar", label: "Buscar" },
              { to: "/mensajes", label: "Mensajes", badge: unread },
              { to: "/perfil", label: "Mi perfil" },
              ...(me?.role === "admin" ? [{ to: "/admin", label: "Panel de administrador" }] : []),
            ].map((i) => (
              <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => cn("flex h-12 items-center justify-between rounded-xl px-3 text-[15px] font-semibold", isActive ? "bg-primary-soft text-primary-hover" : "text-ink hover:bg-surface-alt")}>
                {i.label} <UnreadBadge n={i.badge ?? 0} />
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-2 border-t border-line pt-5">
            {me ? (
              <Button variant="outline" onClick={() => { setMenu(false); doLogout(); }}><LogOut /> Cerrar sesión</Button>
            ) : (
              <>
                <Button onClick={() => nav("/bienvenida", { state: { from: loc.pathname } })}><LogIn /> Ingresar</Button>
                <Button variant="outline" onClick={() => nav("/registro", { state: { from: loc.pathname } })}>Crear cuenta</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}

function Footer() {
  const nav = useNavigate();
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <Container className="flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <Logo size={30} />
            <Wordmark className="text-lg" />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">Mascotas perdidas y encontradas en Cochabamba. Publica gratis, recibe mensajes de vecinos y amplifica tu búsqueda con anuncios en redes.</p>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <p className="col-span-2 mb-1 text-xs font-bold uppercase tracking-[0.08em] text-ink-subtle">Explorar</p>
          <button onClick={() => nav("/buscar")} className="py-1 text-left font-medium text-ink-muted hover:text-ink">Buscar mascotas</button>
          <button onClick={() => nav("/publicar")} className="py-1 text-left font-medium text-ink-muted hover:text-ink">Publicar mascota</button>
          <button onClick={() => nav("/mensajes")} className="py-1 text-left font-medium text-ink-muted hover:text-ink">Mensajes</button>
          <button onClick={() => nav("/perfil")} className="py-1 text-left font-medium text-ink-muted hover:text-ink">Mi perfil</button>
        </div>
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-wrap justify-between gap-2 py-4 text-xs text-ink-subtle">
          <span>Cochabamba, Bolivia · Precios en bolivianos (Bs.)</span>
          <span>Prototipo Entrega 1 · los datos son de demostración</span>
        </Container>
      </div>
    </footer>
  );
}

function AdminOnly({ children }: { children: JSX.Element }) {
  const isAdmin = useApp((s) => s.users.find((u) => u.id === s.sessionUserId)?.role === "admin");
  return isAdmin ? children : <Navigate to="/perfil" replace />;
}

function ScrollTop() {
  const loc = useLocation();
  useEffect(() => {
    try {
      window.scrollTo({ top: 0 });
    } catch {
      /* ignore */
    }
  }, [loc.pathname]);
  return null;
}

function Shell() {
  const loc = useLocation();
  const auth = AUTH_ROUTES.some((r) => r.test(loc.pathname));
  const chat = loc.pathname.startsWith("/mensajes");
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <ScrollTop />
      {!auth && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/bienvenida" element={<Welcome />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/" element={<Feed />} />
          <Route path="/buscar" element={<SearchScreen />} />
          <Route path="/publicar" element={<Publish />} />
          <Route path="/publicacion/:id" element={<Detail />} />
          <Route path="/mensajes" element={<Messages />} />
          <Route path="/mensajes/:id" element={<Messages />} />
          <Route path="/promocionar/:postId" element={<Promote />} />
          <Route path="/promocion/:id" element={<Payment />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/admin" element={<AdminOnly><Admin /></AdminOnly>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!auth && !chat && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <Shell />
      <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: "inherit", borderRadius: 16, fontSize: 14 } }} richColors offset={16} />
    </MemoryRouter>
  );
}
