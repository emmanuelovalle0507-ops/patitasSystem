import { requireUser } from "@/lib/auth";
import { ChatAssistant } from "@/components/ai/chat-assistant";
import { Sparkles, Stethoscope, FileText, Compass, Heart, Ban, ShieldCheck, BookOpen, Zap } from "lucide-react";

export const metadata = { title: "Patitas AI" };

const CAPABILITIES = [
  {
    icon: Stethoscope,
    title: "Cuidado y salud",
    body: "Vacunas, desparasitación, alimentación, hábitos y señales de alarma.",
    color: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  },
  {
    icon: FileText,
    title: "Reportes y carteles",
    body: "Te ayudo a redactar un buen reporte y un cartel con alto impacto.",
    color: "bg-brand-100 text-brand-700 ring-brand-200",
  },
  {
    icon: Compass,
    title: "Mascota perdida",
    body: "Guía paso a paso para las primeras 24–48 h, zonas clave y qué decir.",
    color: "bg-rose-100 text-rose-700 ring-rose-200",
  },
  {
    icon: BookOpen,
    title: "Datos y curiosidades",
    body: "Información educativa verificada sobre razas, especies y comportamiento.",
    color: "bg-violet-100 text-violet-700 ring-violet-200",
  },
];

const LIMITATIONS = [
  "Solo respondo sobre mascotas — rechazo temas fuera de ese alcance.",
  "No sustituyo a un veterinario. Para diagnósticos o dosis, acude a un profesional.",
  "No invento datos: si no tengo certeza, lo digo con honestidad.",
  "Cito fuentes confiables (AVMA, ASPCA, WSAVA…) cuando aporto información factual.",
];

export default async function AssistantPage({ searchParams }: { searchParams: { q?: string } }) {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-6xl">
      <section className="-mx-4 md:-mx-8 mb-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-orange-500 to-rose-500 px-4 md:px-8 pt-8 pb-10 text-white">
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.5),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.35),transparent_55%)]" />
          <div className="pointer-events-none absolute -right-8 -top-10 text-[160px] leading-none opacity-[0.08] select-none">
            🐾
          </div>
          <div className="relative mx-auto max-w-6xl flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur ring-1 ring-white/30">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur ring-1 ring-white/25">
                  <Zap className="h-3 w-3" /> Asistente con IA
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                  Patitas AI
                </h1>
                <p className="max-w-xl text-sm md:text-base text-white/90">
                  Hola {user.name.split(" ")[0]}, soy tu asistente experto <strong>exclusivamente en mascotas</strong>. Pregúntame sobre cuidados, salud, reportes o qué hacer si tu mascota se perdió.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs ring-1 ring-white/20">
                <ShieldCheck className="h-3.5 w-3.5" /> No inventa datos
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs ring-1 ring-white/20">
                <BookOpen className="h-3.5 w-3.5" /> Cita fuentes
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs ring-1 ring-white/20">
                <Heart className="h-3.5 w-3.5" /> Hecho para mascotas
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4 mb-5">
        {CAPABILITIES.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="rounded-xl border bg-card p-4 hover:shadow-sm transition">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 mb-2 ${c.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold leading-tight">{c.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-5 rounded-xl border bg-amber-50/60 dark:bg-amber-950/20 ring-1 ring-amber-200/50 dark:ring-amber-900/40 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200/60">
            <Ban className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
              Límites y cómo trabaja
            </h3>
            <ul className="grid gap-1 sm:grid-cols-2 text-xs text-muted-foreground leading-relaxed">
              {LIMITATIONS.map((l) => (
                <li key={l} className="flex items-start gap-1.5">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ChatAssistant initialQuery={searchParams.q ?? null} />
    </div>
  );
}
