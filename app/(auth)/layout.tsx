import Link from "next/link";
import { Heart, MapPin, ShieldCheck, Bell, PawPrint, Sparkles } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: MapPin,
    title: "Reportes geolocalizados",
    body: "Ubica en el mapa dónde se perdió o apareció una mascota cerca de ti.",
  },
  {
    icon: Bell,
    title: "Alertas en tiempo real",
    body: "Recibe avisos cuando alguien reporta una mascota en tu radio.",
  },
  {
    icon: ShieldCheck,
    title: "Seguro y privado",
    body: "Controlas qué datos de contacto son visibles. Nunca compartimos tu información.",
  },
  {
    icon: Sparkles,
    title: "Asistente con IA",
    body: "Te guía paso a paso y te ayuda a crear reportes con alto impacto.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Hero / Showcase — visible on lg+ */}
      <aside className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-orange-500 to-rose-500 text-white p-10 xl:p-12">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.5),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.4),transparent_55%),radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.3),transparent_50%)]" />
        <div className="pointer-events-none absolute -right-16 -top-16 text-[280px] leading-none opacity-[0.07] select-none">
          🐾
        </div>
        <div className="pointer-events-none absolute -left-20 bottom-10 text-[200px] leading-none opacity-[0.06] select-none rotate-12">
          🐶
        </div>

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur ring-1 ring-white/30 text-2xl">
              🐾
            </span>
            <span className="font-display text-2xl font-bold">PatiTas</span>
          </Link>
        </div>

        <div className="relative space-y-8 max-w-md">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ring-1 ring-white/25 mb-4">
              <Heart className="h-3 w-3 fill-current" />
              Reencuentros que importan
            </div>
            <h2 className="font-display text-4xl xl:text-5xl font-bold leading-[1.05]">
              Cada pata cuenta.
              <br />
              <span className="text-white/80">Cada reencuentro, también.</span>
            </h2>
            <p className="mt-4 text-white/90 text-base leading-relaxed">
              PatiTas es la red vecinal que ayuda a que las mascotas perdidas vuelvan a casa en Tecámac y la Zona Metropolitana.
            </p>
          </div>

          <ul className="space-y-3.5">
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon;
              return (
                <li key={h.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/25">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{h.title}</div>
                    <div className="text-xs text-white/80 leading-relaxed">{h.body}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20 p-3 max-w-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <div className="text-xs">
              <div className="font-semibold">100% gratis · sin publicidad</div>
              <div className="text-white/80">Iniciativa comunitaria sin fines de lucro</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-col min-h-screen">
        {/* Mobile-only top branding */}
        <header className="lg:hidden border-b bg-gradient-to-br from-brand-50 to-background">
          <div className="container flex items-center justify-between py-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span className="font-display text-xl font-bold text-brand-600">PatiTas</span>
            </Link>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <PawPrint className="h-3 w-3" />
              Tecámac · EdoMex
            </span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <footer className="px-4 pb-6 text-center text-[11px] text-muted-foreground">
          <div className="flex items-center justify-center gap-3">
            <Link href="/legal/terms" className="hover:text-foreground hover:underline">Términos</Link>
            <span className="opacity-40">·</span>
            <Link href="/legal/privacy" className="hover:text-foreground hover:underline">Privacidad</Link>
            <span className="opacity-40">·</span>
            <span>© {new Date().getFullYear()} PatiTas</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
