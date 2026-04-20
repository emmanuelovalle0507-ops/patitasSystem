"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PlusCircle, Share2, Users, PartyPopper, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: PlusCircle,
    color: "from-brand-500 to-orange-500",
    title: "1. Reporta",
    description: "Sube una foto clara, describe a tu mascota y marca la última ubicación en el mapa. Toma menos de 2 minutos.",
    tip: "Mientras más detalles (señas, collar, microchip), mejor.",
  },
  {
    icon: Share2,
    color: "from-sky-500 to-blue-500",
    title: "2. Comparte",
    description: "Genera un cartel PDF listo para imprimir y comparte el reporte por WhatsApp, Facebook y grupos de tu zona.",
    tip: "El QR del cartel lleva a la gente a tu reporte con todas las fotos.",
  },
  {
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    title: "3. Recibe ayuda",
    description: "La comunidad PatiTas cerca de ti recibirá tu reporte. Si alguien ve a tu mascota, te contactará directamente.",
    tip: "Activa las notificaciones para no perder ninguna pista.",
  },
  {
    icon: PartyPopper,
    color: "from-rose-500 to-pink-500",
    title: "4. Reencuentro",
    description: "Cuando la encuentres, marca el reporte como 'Encontrada'. Así celebramos contigo y ayudamos a otros.",
    tip: "Tu historia puede inspirar a más personas a no rendirse.",
  },
];

export function HowItWorksModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const Step = STEPS[step];
  const Icon = Step.icon;
  const isLast = step === STEPS.length - 1;

  function close() {
    setOpen(false);
    setTimeout(() => setStep(0), 300);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className={cn("relative bg-gradient-to-br px-6 pt-8 pb-6 text-white", Step.color)}>
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.4),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.3),transparent_50%)]" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur ring-1 ring-white/30">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <DialogHeader className="text-left space-y-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80">Paso {step + 1} de {STEPS.length}</p>
                <DialogTitle className="text-xl font-display font-bold text-white">{Step.title}</DialogTitle>
              </DialogHeader>
            </div>
          </div>
          <div className="relative mt-5 flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "h-1 flex-1 rounded-full transition",
                  i === step ? "bg-white" : i < step ? "bg-white/70" : "bg-white/25"
                )}
                aria-label={`Ir al paso ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          <DialogDescription className="text-sm text-foreground leading-relaxed">
            {Step.description}
          </DialogDescription>
          <div className="rounded-lg bg-muted/60 border px-3 py-2 text-xs text-muted-foreground">
            💡 <span className="font-medium">Tip:</span> {Step.tip}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </Button>
            {isLast ? (
              <Button asChild size="sm" className="gap-1.5 bg-brand-600 hover:bg-brand-700" onClick={close}>
                <Link href="/posts/new">
                  Crear mi primer reporte
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} className="gap-1 bg-brand-600 hover:bg-brand-700">
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
