# Cocha Pet

Prototipo funcional de la **Entrega 1** de Cocha Pet: plataforma de mascotas perdidas y encontradas para Cochabamba, Bolivia.

> Prototipo sin backend: los datos viven en el navegador (Zustand + localStorage). Los pagos QR y el inicio de sesión con Google son simulados.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · componentes estilo shadcn/ui (Radix) · Zustand · qrcode.react · lucide-react · sonner

## Historias de usuario cubiertas

HU01–HU04 (cuenta), HU15–HU20 (reportar), HU22 (buscar), HU26 (vista básica), HU29–HU31 (contacto y chat), HU33–HU37 (promoción y panel de administrador).

## Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Build

```bash
npm run build
```

Genera `dist/index.html`, un solo archivo con todo incluido (JS, CSS y fotos de ejemplo).

## Cuentas de demostración

- **María Montenegro** (usuario): "Continuar con Google" → elegir María.
- **Lucía Fernández**: "Continuar con Google" → elegir Lucía (se registra como cuenta nueva).
- **Admin Patas** (administrador): "Ingresar" → "Entrar como administrador".
- "Reiniciar demo" en el Perfil restaura los datos de ejemplo.

## Estructura

```
src/
  App.tsx            rutas, header, footer
  components/        componentes comunes y ui/ (button, input, dialog, badge)
  lib/               tipos, constantes (zonas, planes), utilidades
  screens/           una pantalla por archivo
  seed/              datos y fotos de ejemplo
  store/useApp.ts    estado global (Zustand persistido)
```
