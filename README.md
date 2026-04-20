# 🐾 PatiTas

**Buscador de mascotas perdidas para Tecámac y zona metropolitana del Estado de México.**

App web responsiva (mobile-first, PWA) que conecta vecinos para ayudar a encontrar mascotas perdidas. Reportes geolocalizados, notificaciones push cuando alguien pierde una mascota cerca de ti, generador de carteles PDF, feed social y asistente IA personalizado.

## Stack

- **Framework**: Next.js 14 (App Router, Server Actions, TypeScript)
- **UI**: TailwindCSS + shadcn-style + Radix UI + Lucide icons
- **DB**: PostgreSQL + PostGIS (Supabase) · ORM Prisma
- **Auth**: Supabase Auth (email/pwd + Google OAuth)
- **Storage**: Supabase Storage (transformaciones on-the-fly)
- **IA**: OpenAI GPT-4o-mini (chat conversacional + Vision para moderación)
- **Mapas**: MapLibre GL + OpenFreeMap (tiles gratis) + Nominatim (geocoding)
- **Push**: Web Push nativo (VAPID) + Service Worker PWA
- **PDF**: @react-pdf/renderer (3 plantillas, Carta/A4)
- **OG Images**: @vercel/og (preview social dinámico por post)
- **Email**: Resend (opcional)

## Requisitos previos

- Node.js ≥ 20
- Cuenta Supabase (gratis)
- API key OpenAI (de pago)
- (Opcional) Resend para emails

## Instalación

```bash
# 1. Instala dependencias
npm install

# 2. Copia variables de entorno
cp .env.example .env
# Edita .env con tus credenciales reales
```

### Generar llaves VAPID para Web Push

```bash
npx web-push generate-vapid-keys
```

Copia `publicKey` a `NEXT_PUBLIC_VAPID_PUBLIC_KEY` y `privateKey` a `VAPID_PRIVATE_KEY`.

### Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Copia `URL`, `anon key` y `service_role key` a `.env`.
3. Copia la cadena de conexión a `DATABASE_URL` y `DIRECT_URL` (ver `.env.example`).
4. **Activa OAuth Google**: Dashboard → Auth → Providers → Google.

### Configurar Supabase Storage

1. En el dashboard de Supabase → **Storage** (sidebar) → **New bucket**.
2. Nombre: `patitas-photos`. Activa **Public bucket**. Click **Save**.
3. Listo. Las fotos se guardan bajo `users/<user-id>/<uuid>.<ext>` y se sirven por CDN.

## Base de datos

```bash
# 1. Migración inicial con Prisma
npm run prisma:migrate

# 2. Ejecuta el script de PostGIS (en Supabase SQL Editor)
#    Copia y pega el contenido de prisma/postgis-setup.sql

# 3. (Opcional) Semilla de datos demo
npm run db:seed
```

## Desarrollo

```bash
npm run dev
# http://localhost:3000
```

## Estructura

```
app/
  (auth)/           # login, register
  (app)/            # zona autenticada (layout con navbar+bottom-nav)
    dashboard/
    feed/
    posts/new, posts/[id]
    posters/[postId]
    notifications/
    settings/
    assistant/
  api/
    ai/chat, ai/moderate
    poster/pdf
    push/subscribe
    og/[id]
    images/delete
  actions/          # Server Actions (posts, profile)
  onboarding/
  auth/callback/

components/
  ui/               # primitives
  layout/           # navbar, bottom-nav, sw-register
  map/              # MapPicker (Mapbox)
  post/             # PostCard, ImageUpload, StatusBadge, etc.
  poster/           # PosterPDF (react-pdf)
  ai/               # ChatAssistant, AssistantQuickCard

lib/
  db.ts, auth.ts, claude.ts, moderation.ts,
  storage.ts, push.ts, geo.ts, validators.ts,
  supabase/server.ts, supabase/client.ts

prisma/
  schema.prisma
  postgis-setup.sql
  seed.ts

public/
  sw.js             # Service Worker (push + PWA)
  icons/            # íconos PWA (agregar manualmente)
```

## Funcionalidades

- ✅ Registro + login (email/pwd + Google OAuth)
- ✅ Onboarding con `favoritePets` (personaliza asistente IA)
- ✅ CRUD posts de mascota perdida con fotos (validadas por IA) y mapa
- ✅ Feed comunidad con likes y comentarios
- ✅ Generador de cartel PDF (3 plantillas, Carta/A4)
- ✅ Compartir en redes (WhatsApp, FB, X, Telegram) con OG image dinámica
- ✅ Notificaciones geolocalizadas (in-app + Web Push via ST_DWithin)
- ✅ Asistente IA Claude (streaming, personalizado)
- ✅ Dashboard agregado
- ✅ PWA instalable
- ✅ Geo-delimitación a Tecámac + 7 municipios colindantes

## Moderación de imágenes (solo mascotas)

Cada imagen subida pasa por Claude Vision (`claude-sonnet-4-20250514`) con un prompt de clasificación. Si el modelo retorna `isPet=false` o confianza < 0.7, la imagen se rechaza y se borra del bucket de Supabase Storage automáticamente.

## Íconos PWA

Agrega en `public/icons/`:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

Puedes generarlos desde cualquier logo con [realfavicongenerator.net](https://realfavicongenerator.net) o similar.

## Deploy a Vercel

```bash
# 1. Conecta el repo a Vercel
# 2. Añade TODAS las variables de .env.example en Vercel → Settings → Env Variables
# 3. Deploy automático al push a main
```

Supabase ya está listo desde su dashboard — no requiere deploy extra.

## Roadmap v2

- Moderación colaborativa y rol moderador
- Reportes de avistamiento con mapa de calor
- App móvil nativa (Expo, reutilizando lib/)
- Integración con refugios y veterinarias asociadas

---

Hecho con 🧡 en Tecámac, Edo. Méx.
