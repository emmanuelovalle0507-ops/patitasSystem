"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "¿PatiTas es gratis?",
    a: "Sí, completamente gratis. PatiTas es una iniciativa comunitaria sin fines de lucro para ayudar a vecinos de Tecámac y la Zona Metropolitana a reencontrar a sus mascotas.",
  },
  {
    q: "¿Cómo funciona el sistema de alertas?",
    a: "Cuando alguien publica un reporte de mascota perdida, enviamos una notificación push a los usuarios que se encuentran dentro del radio que hayas configurado (por defecto 3 km). Tú decides qué tan cerca quieres recibir avisos.",
  },
  {
    q: "¿Puedo reportar mascotas encontradas que no son mías?",
    a: "¡Claro que sí! Si encontraste una mascota perdida o avistaste una, puedes crear un reporte para que su familia la encuentre más rápido.",
  },
  {
    q: "¿Qué datos de contacto comparto con la comunidad?",
    a: "Tú controlas qué es visible: puedes mostrar tu WhatsApp, teléfono, correo o ninguno. Por defecto solo compartimos WhatsApp para facilitar el contacto directo.",
  },
  {
    q: "¿Puedo generar un cartel para imprimir?",
    a: "Sí. En menos de 1 minuto generamos un PDF listo para imprimir con la foto, descripción, código QR y datos de contacto de tu mascota. Puedes elegir entre 3 plantillas distintas.",
  },
  {
    q: "¿Qué zonas cubre PatiTas?",
    a: "Actualmente nos enfocamos en Tecámac y municipios vecinos del Estado de México: Ecatepec, Zumpango, Ojo de Agua, Coacalco y zonas aledañas. Pronto ampliaremos la cobertura.",
  },
  {
    q: "¿El asistente de IA sustituye a un veterinario?",
    a: "No. Patitas AI sólo brinda orientación general sobre cuidados, comportamiento y cómo actuar ante una pérdida. Para cualquier tema de salud o diagnóstico, siempre consulta a tu veterinario de confianza.",
  },
  {
    q: "¿Cómo protegen mi información personal?",
    a: "Nunca vendemos ni compartimos tus datos. La información de contacto solo se muestra si tú lo autorizas en los ajustes de privacidad. Cumplimos con la LFPDPPP (Ley Federal de Protección de Datos Personales).",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y rounded-2xl border bg-card overflow-hidden shadow-sm">
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 p-4 md:p-5 text-left transition hover:bg-muted/40"
              aria-expanded={isOpen}
            >
              <span className={cn("font-semibold text-sm md:text-base transition", isOpen && "text-brand-700")}>
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
                  isOpen && "rotate-180 text-brand-600"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-5 md:px-5 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
