import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, PawPrint, Heart, Users, MapPin } from "lucide-react";

type Stat = { label: string; value: number; icon: any; tone: "rose" | "emerald" | "sky" | "amber" };

const TONES: Record<Stat["tone"], string> = {
  rose: "bg-rose-500/20 text-rose-100 ring-rose-300/40",
  emerald: "bg-emerald-500/20 text-emerald-100 ring-emerald-300/40",
  sky: "bg-sky-500/20 text-sky-100 ring-sky-300/40",
  amber: "bg-amber-500/20 text-amber-100 ring-amber-300/40",
};

export function FeedHero({
  tab,
  active,
  reunited,
  community,
  newToday,
}: {
  tab: "lost" | "community";
  active: number;
  reunited: number;
  community: number;
  newToday: number;
}) {
  const stats: Stat[] = [
    { label: "Perdidos activos", value: active, icon: MapPin, tone: "rose" },
    { label: "Reencuentros", value: reunited, icon: Heart, tone: "emerald" },
    { label: "Nuevos hoy", value: newToday, icon: PawPrint, tone: "amber" },
    { label: "Comunidad", value: community, icon: Users, tone: "sky" },
  ];

  return (
    <section className="-mx-4 md:-mx-8 mb-4">
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-orange-500 to-rose-500 px-4 md:px-8 pt-8 pb-10 text-white">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.5),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.35),transparent_55%)]" />
        <div className="pointer-events-none absolute -right-10 -top-10 text-[160px] leading-none opacity-[0.08] select-none">
          🐾
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur ring-1 ring-white/25">
                <PawPrint className="h-3 w-3" />
                {tab === "lost" ? "Perdidos cerca de ti" : "Comunidad PatiTas"}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                {tab === "lost" ? "Ayuda a que vuelvan a casa" : "Historias, consejos y avisos"}
              </h1>
              <p className="max-w-xl text-sm md:text-base text-white/90">
                {tab === "lost"
                  ? "Revisa los reportes más recientes de tu zona. Una vista, un comentario o un share pueden cambiarlo todo."
                  : "Lo que la comunidad está compartiendo: reencuentros, avisos, consejos y mucho más."}
              </p>
            </div>

            <div className="flex gap-2">
              <Button asChild size="lg" className="bg-white text-brand-700 hover:bg-white/95 shadow-lg shadow-black/10 gap-2">
                <Link href="/posts/new">
                  <PlusCircle className="h-4 w-4" />
                  Reportar
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 px-3 py-2.5 flex items-center gap-3"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${TONES[s.tone]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-xl font-bold leading-none">{s.value}</div>
                    <div className="text-[11px] text-white/80 truncate">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
