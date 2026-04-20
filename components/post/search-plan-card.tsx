"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw, AlertCircle, Copy, Check, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ai/markdown";
import { cn } from "@/lib/utils";

type Props = {
  postId: string;
  initialPlan: string | null;
  initialGeneratedAt: string | null;
};

export function SearchPlanCard({ postId, initialPlan, initialGeneratedAt }: Props) {
  const [plan, setPlan] = useState<string | null>(initialPlan);
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialGeneratedAt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate(force: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/search-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, force }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al generar plan");
      setPlan(data.plan);
      setGeneratedAt(data.generatedAt);
    } catch (e: any) {
      setError(e.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function copyPlan() {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(plan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent
    }
  }

  if (!plan) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 via-amber-50 to-rose-50 p-5 shadow-sm">
        <div className="absolute -right-6 -top-6 text-8xl opacity-10 select-none">🧭</div>
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-lg shadow-brand-500/20 sm:h-14 sm:w-14">
            <Route className="h-5 w-5 sm:h-7 sm:w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 ring-1 ring-brand-200">
                <Sparkles className="h-2.5 w-2.5" />
                IA
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Nuevo</span>
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold text-brand-900 leading-tight">Plan de búsqueda personalizado</h3>
            <p className="mt-1 text-xs sm:text-sm text-brand-800/80 leading-snug">
              Te damos una ruta paso a paso según especie, tiempo y zona — en 10 segundos.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => generate(false)}
            disabled={loading}
            className="w-full sm:w-auto gap-2 bg-gradient-to-r from-brand-600 to-orange-500 hover:from-brand-700 hover:to-orange-600 text-white shadow-md shadow-brand-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generar plan
              </>
            )}
          </Button>
        </div>
        {error && (
          <div
            role="alert"
            className="relative mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-white via-brand-50/30 to-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b bg-gradient-to-r from-brand-50 to-amber-50 px-3 py-3 sm:gap-3 sm:px-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow">
            <Route className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-bold text-brand-900 truncate">Tu plan de búsqueda</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-700 ring-1 ring-brand-200">
                <Sparkles className="h-2.5 w-2.5" />
                IA
              </span>
            </div>
            {generatedAt && (
              <div className="text-[11px] text-brand-700/70">
                Generado {new Date(generatedAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyPlan}
            className="h-8 gap-1.5 text-brand-700 hover:bg-white/60"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copiado" : "Copiar"}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => generate(true)}
            disabled={loading}
            className={cn("h-8 gap-1.5 text-brand-700 hover:bg-white/60", loading && "opacity-60")}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{loading ? "Actualizando…" : "Regenerar"}</span>
          </Button>
        </div>
      </div>
      <div className="px-4 py-4 text-sm sm:px-5">
        <Markdown>{plan}</Markdown>
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-[11px] leading-relaxed text-amber-900">
          ⚠️ Este plan es una *sugerencia* basada en patrones de comportamiento típicos. Ajústalo a tu
          conocimiento real de {"\u200B"}la zona y tu mascota. Para emergencias médicas, contacta a un veterinario.
        </div>
      </div>
    </div>
  );
}
