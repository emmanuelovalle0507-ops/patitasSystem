"use client";

import Link from "next/link";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Camera, Sparkles, MapPin, MessageCircle, Gift, Shield, Lightbulb, ArrowRight,
} from "lucide-react";

const TIPS = [
  {
    icon: Camera,
    title: "Foto clara y de día",
    body: "Evita fotos borrosas, sombras fuertes o filtros. Una foto frontal con luz natural es la mejor pista.",
    color: "text-sky-700 bg-sky-50 ring-sky-200",
  },
  {
    icon: Sparkles,
    title: "Señas únicas",
    body: "Menciona detalles que la distingan: cicatrices, manchas, collar con placa, microchip, patrón del pelaje.",
    color: "text-violet-700 bg-violet-50 ring-violet-200",
  },
  {
    icon: MapPin,
    title: "Ubicación exacta",
    body: "Marca en el mapa dónde la viste por última vez. Mientras más preciso, más probable que vecinos cercanos ayuden.",
    color: "text-emerald-700 bg-emerald-50 ring-emerald-200",
  },
  {
    icon: MessageCircle,
    title: "Contacto verificado",
    body: "Agrega WhatsApp si puedes — es el canal más usado. Verifica que tu teléfono sea correcto.",
    color: "text-rose-700 bg-rose-50 ring-rose-200",
  },
  {
    icon: Gift,
    title: "Recompensa (si puedes)",
    body: "Ofrecer una recompensa —aunque sea simbólica— triplica la probabilidad de respuesta.",
    color: "text-amber-700 bg-amber-50 ring-amber-200",
  },
  {
    icon: Shield,
    title: "Nota de seguridad",
    body: "Si tu mascota es tímida o miedosa, pide que no la persigan y te avisen. Evita que se asuste más.",
    color: "text-slate-700 bg-slate-100 ring-slate-200",
  },
];

export function ReportTipsModal({ trigger }: { trigger: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 ring-1 ring-amber-200">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl">Consejos para un buen reporte</DialogTitle>
              <DialogDescription>
                Reportes con estos elementos reciben hasta 3× más respuestas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {TIPS.map((tip) => (
            <div key={tip.title} className="rounded-xl border bg-card p-4 hover:shadow-sm transition">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ring-1 mb-2 ${tip.color}`}>
                <tip.icon className="h-4 w-4" />
              </div>
              <h4 className="font-semibold text-sm mb-0.5">{tip.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{tip.body}</p>
            </div>
          ))}
        </div>

        <DialogFooter className="mt-2">
          <Button asChild className="w-full sm:w-auto gap-2 bg-brand-600 hover:bg-brand-700">
            <Link href="/posts/new">
              Crear reporte
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
