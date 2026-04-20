import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MapPin, Bell, Sparkles, Printer, Heart, PlusCircle, Share2,
  PartyPopper, ArrowRight, ShieldCheck, MessageCircle,
  PawPrint, QrCode, Lock,
} from "lucide-react";
import { db } from "@/lib/db";
import { StoriesCarousel, type Story } from "@/components/landing/stories-carousel";
import { LiveLostCarousel, type LivePost } from "@/components/landing/live-lost-carousel";
import { Faq } from "@/components/landing/faq";

export const revalidate = 60;

const STEPS = [
  {
    icon: PlusCircle,
    title: "Reporta en 2 minutos",
    body: "Sube una foto, describe a tu mascota y marca la última ubicación en el mapa.",
    accent: "from-brand-500 to-orange-500",
  },
  {
    icon: Share2,
    title: "Comparte en un clic",
    body: "Genera un cartel PDF con QR y compártelo por WhatsApp, Facebook o grupos vecinales.",
    accent: "from-sky-500 to-blue-600",
  },
  {
    icon: Bell,
    title: "La comunidad se activa",
    body: "Los vecinos cerca de ti reciben una alerta en tiempo real para estar atentos.",
    accent: "from-violet-500 to-purple-600",
  },
  {
    icon: PartyPopper,
    title: "Reencuentro 💚",
    body: "Cuando la encuentres, marca el reporte como 'En casa' y celebramos contigo.",
    accent: "from-emerald-500 to-teal-500",
  },
];

const FEATURES = [
  {
    icon: MapPin,
    title: "Geolocalización precisa",
    body: "Reportes enfocados en Tecámac y municipios vecinos, con radio ajustable a tu zona.",
    tint: "bg-brand-50 text-brand-700 ring-brand-200",
  },
  {
    icon: Bell,
    title: "Alertas al instante",
    body: "Notificaciones push apenas alguien reporta una mascota cerca de ti.",
    tint: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  {
    icon: Printer,
    title: "Carteles listos para imprimir",
    body: "3 plantillas, código QR y descarga en PDF con un toque.",
    tint: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    icon: Sparkles,
    title: "Asistente IA",
    body: "Consejos personalizados y guía paso a paso para recuperar a tu mascota.",
    tint: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  {
    icon: MessageCircle,
    title: "Contacto directo",
    body: "WhatsApp nativo, comentarios y pistas de la comunidad en cada reporte.",
    tint: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  {
    icon: ShieldCheck,
    title: "Privacidad primero",
    body: "Tú decides qué datos compartir. Nunca los vendemos ni cedemos a terceros.",
    tint: "bg-sky-50 text-sky-700 ring-sky-200",
  },
];

export default async function LandingPage() {
  const [recentLost, foundPosts] = await Promise.all([
    db.post.findMany({
      where: { kind: "LOST", status: { in: ["LOST", "IN_PROGRESS"] } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { images: { take: 1 }, pet: true },
    }).catch(() => []),
    db.post.findMany({
      where: { kind: "LOST", status: "FOUND" },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: { images: { take: 1 }, pet: true, author: { select: { name: true } } },
    }).catch(() => []),
  ]);

  const livePosts: LivePost[] = recentLost.map((p) => ({
    id: p.id,
    title: p.title,
    areaLabel: p.areaLabel,
    createdAt: p.createdAt,
    imageUrl: p.images[0]?.url ?? null,
    petKind: p.pet?.kind ?? null,
  }));

  const stories: Story[] = foundPosts.map((p) => {
    const days = Math.max(
      1,
      Math.round((new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime()) / 86_400_000)
    );
    return {
      id: p.id,
      petName: p.pet?.name ?? p.title,
      areaLabel: p.areaLabel ?? "Tecámac",
      daysLost: days,
      imageUrl: p.images[0]?.url ?? null,
      quote:
        p.description.slice(0, 180) +
        (p.description.length > 180 ? "..." : ""),
      authorName: p.author?.name ?? "Familia PatiTas",
    };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2" aria-label="PatiTas inicio">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-sm text-lg">
              🐾
            </span>
            <span className="font-display text-xl font-bold text-foreground">
              Pati<span className="text-brand-600">Tas</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition">Cómo funciona</a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition">FAQ</a>
          </nav>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white shadow-sm">
              <Link href="/register">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-amber-50/40 to-rose-50/60" />
        <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_15%_30%,rgba(249,115,22,0.12),transparent_50%),radial-gradient(circle_at_85%_70%,rgba(244,63,94,0.12),transparent_50%)]" />
        <div className="pointer-events-none absolute -right-20 top-20 text-[320px] leading-none opacity-[0.05] select-none">🐾</div>

        <div className="container relative py-14 md:py-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 backdrop-blur px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-muted-foreground">Tecámac · Estado de México</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.02]">
              Ayudemos a que
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-brand-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                  vuelvan a casa
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-brand-200/60 -z-0 rounded-full" aria-hidden />
              </span>
              <span className="ml-2">🐾</span>
            </h1>

            <p className="mx-auto lg:mx-0 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              PatiTas es la red vecinal que conecta a familias del Estado de México para encontrar mascotas perdidas. Publica, comparte y recibe alertas cerca de ti, <strong className="text-foreground">en tiempo real y gratis</strong>.
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Button asChild size="lg" className="h-12 gap-2 bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 text-white shadow-lg shadow-brand-500/30">
                <Link href="/register">
                  <PlusCircle className="h-5 w-5" />
                  Reportar una mascota
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 gap-2 border-2 bg-white/70 backdrop-blur hover:bg-white">
                <Link href="/feed">
                  Ver comunidad
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 justify-center lg:justify-start pt-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span><strong className="text-foreground">100% gratis</strong> · sin publicidad</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Lock className="h-4 w-4 text-sky-600" />
                <span>Tus datos <strong className="text-foreground">nunca</strong> se venden</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4 text-brand-600" />
                <span>Hecho para <strong className="text-foreground">Tecámac</strong></span>
              </div>
            </div>
          </div>

          {/* Product feature preview cluster */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-brand-500/10 via-orange-500/10 to-rose-500/10 rotate-6" />

              {/* Alert notification mockup */}
              <div className="absolute top-6 right-4 w-60 rotate-[-4deg] rounded-2xl bg-white p-3.5 shadow-2xl ring-1 ring-black/5">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Alerta cercana</div>
                      <div className="text-[10px] text-muted-foreground">ahora</div>
                    </div>
                    <div className="mt-1 text-sm font-semibold leading-snug">Nuevo reporte a 300 m de ti</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Abre la app para ver detalles</div>
                  </div>
                </div>
              </div>

              {/* Map preview mockup */}
              <div className="absolute top-[38%] left-2 w-56 rotate-[4deg] rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 z-10">
                <div className="relative aspect-[5/4] rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 via-sky-50 to-violet-100">
                  <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(20,83,45,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(20,83,45,0.12)_1px,transparent_1px)] [background-size:24px_24px]" />
                  <div className="absolute left-[28%] top-[32%]">
                    <div className="relative">
                      <div className="absolute inset-0 -m-3 rounded-full bg-rose-500/20 animate-ping" />
                      <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 ring-2 ring-white shadow">
                        <MapPin className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-[22%] bottom-[24%] flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 ring-2 ring-white shadow">
                    <MapPin className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div className="absolute left-[55%] top-[18%] flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 ring-2 ring-white shadow">
                    <MapPin className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
                <div className="px-1.5 py-1.5 flex items-center justify-between">
                  <div className="text-[11px] font-semibold">Mapa en vivo</div>
                  <div className="text-[10px] text-muted-foreground">Radio 3 km</div>
                </div>
              </div>

              {/* QR poster mockup */}
              <div className="absolute bottom-2 right-10 w-44 rotate-[6deg] rounded-2xl bg-white p-2.5 shadow-2xl ring-1 ring-black/5">
                <div className="rounded-xl bg-gradient-to-b from-brand-50 to-white border p-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Cartel PDF</div>
                  <div className="mt-1 font-display text-sm font-bold">¿La has visto?</div>
                  <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-lg bg-foreground/90 text-white">
                    <QrCode className="h-8 w-8" />
                  </div>
                  <div className="mt-1.5 text-[9px] text-muted-foreground">Escanea para contactar</div>
                </div>
              </div>

              <div className="absolute -top-2 left-10 rounded-full bg-white shadow-xl ring-1 ring-black/5 p-2.5 animate-bounce [animation-duration:3s]">
                <Sparkles className="h-5 w-5 text-brand-500" />
              </div>
              <div className="absolute top-1/2 right-[-8px] rounded-full bg-white shadow-xl ring-1 ring-black/5 p-2.5">
                <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value props strip */}
      <section className="border-y bg-white/50 backdrop-blur">
        <div className="container py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <ValueProp title="Gratis" body="Sin costo, siempre" icon={Heart} tone="brand" />
          <ValueProp title="Tiempo real" body="Alertas cerca de ti" icon={Bell} tone="rose" />
          <ValueProp title="Privado" body="Tú eliges qué compartir" icon={ShieldCheck} tone="emerald" />
          <ValueProp title="Comunidad" body="Vecinos del Edo. Méx." icon={MapPin} tone="amber" />
        </div>
      </section>

      {/* Live lost pets */}
      {livePosts.length > 0 && (
        <section className="container py-14">
          <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider mb-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                </span>
                En vivo
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Reportes recientes</h2>
              <p className="text-muted-foreground mt-1">Tus vecinos necesitan ayuda. Comparte para multiplicar el alcance.</p>
            </div>
            <Link href="/feed" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <LiveLostCarousel posts={livePosts} />
        </section>
      )}

      {/* Cómo funciona */}
      <section id="como-funciona" className="container py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 text-brand-700 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider mb-3">
            <PawPrint className="h-3 w-3" /> 4 pasos sencillos
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Cómo funciona</h2>
          <p className="text-muted-foreground text-lg">Desde el reporte hasta el reencuentro — todo en un solo lugar, pensado para ti y tu comunidad.</p>
        </div>

        <div className="relative grid gap-5 md:grid-cols-4">
          <div className="absolute top-16 left-[12%] right-[12%] h-px bg-gradient-to-r from-brand-300 via-orange-300 to-emerald-300 hidden md:block" aria-hidden />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="relative rounded-2xl border bg-card p-5 hover:shadow-lg transition group">
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.accent} text-white shadow-lg group-hover:scale-110 transition`}>
                  <Icon className="h-6 w-6" />
                  <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-bold text-foreground shadow ring-1 ring-black/5">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Historias / Testimonials slider — solo cuando hay reencuentros reales */}
      {stories.length > 0 && (
        <section id="historias" className="bg-gradient-to-b from-background via-brand-50/40 to-background py-16 md:py-24">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider mb-3">
                <PartyPopper className="h-3 w-3" /> Historias reales
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Reencuentros que nos inspiran</h2>
              <p className="text-muted-foreground text-lg">Familias reales que encontraron a su mascota gracias a la comunidad PatiTas.</p>
            </div>
            <div className="max-w-5xl mx-auto">
              <StoriesCarousel stories={stories} />
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section id="features" className="container py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 text-violet-700 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="h-3 w-3" /> Herramientas
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Todo lo que necesitas, en un solo lugar</h2>
          <p className="text-muted-foreground text-lg">Diseñado específicamente para la realidad de nuestra zona: rápido, gratis y centrado en la comunidad.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="group relative rounded-2xl border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition overflow-hidden">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${f.tint} mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-muted/30 py-16 md:py-24 border-y">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider mb-3">
              <MessageCircle className="h-3 w-3" /> Preguntas frecuentes
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Resolvemos tus dudas</h2>
            <p className="text-muted-foreground text-lg">Lo que la comunidad nos pregunta más seguido.</p>
          </div>
          <Faq />
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-orange-500 to-rose-500 px-6 py-14 md:px-14 md:py-20 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.5),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.35),transparent_55%)]" />
          <div className="pointer-events-none absolute -right-10 -top-10 text-[220px] leading-none opacity-[0.12] select-none">🐾</div>

          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Cada reporte es una oportunidad de <span className="underline decoration-white/40 underline-offset-4">volver a casa</span>.
            </h2>
            <p className="mt-4 text-white/90 text-base md:text-lg">
              Regístrate gratis y sé parte de la comunidad que está cambiando cómo buscamos mascotas perdidas en el Estado de México.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 gap-2 bg-white text-brand-700 hover:bg-white/95 shadow-lg">
                <Link href="/register">
                  <PlusCircle className="h-5 w-5" />
                  Unirme a PatiTas
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 gap-2 border-2 border-white/60 bg-white/10 text-white hover:bg-white/20 backdrop-blur">
                <Link href="/login">Ya tengo cuenta</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container py-12 grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-orange-500 text-white text-lg shadow-sm">🐾</span>
              <span className="font-display text-xl font-bold">PatiTas</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm">
              Red vecinal sin fines de lucro para encontrar mascotas perdidas en Tecámac y la Zona Metropolitana del Estado de México.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart className="h-3.5 w-3.5 text-brand-500" />
              Hecho con cariño en Tecámac, Edo. Méx.
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Plataforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/feed" className="hover:text-foreground">Comunidad</Link></li>
              <li><Link href="/register" className="hover:text-foreground">Crear cuenta</Link></li>
              <li><Link href="/login" className="hover:text-foreground">Iniciar sesión</Link></li>
              <li><a href="#como-funciona" className="hover:text-foreground">Cómo funciona</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/legal/terms" className="hover:text-foreground">Términos</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-foreground">Privacidad</Link></li>
              <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t">
          <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} PatiTas · Todos los derechos reservados</p>
            <p>Si tu mascota es una emergencia médica, acude a un veterinario de inmediato.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ValueProp({
  title,
  body,
  icon: Icon,
  tone,
}: {
  title: string;
  body: string;
  icon: any;
  tone: "brand" | "rose" | "emerald" | "amber";
}) {
  const tones = {
    brand: "bg-brand-100 text-brand-700 ring-brand-200",
    rose: "bg-rose-100 text-rose-700 ring-rose-200",
    emerald: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-100 text-amber-700 ring-amber-200",
  } as const;
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-xl md:text-2xl font-bold leading-none">{title}</div>
        <div className="mt-1 text-xs text-muted-foreground truncate">{body}</div>
      </div>
    </div>
  );
}
