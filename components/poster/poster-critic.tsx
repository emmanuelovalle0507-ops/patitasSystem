"use client";

import { useState } from "react";
import {
  Sparkles, Loader2, AlertCircle, AlertTriangle, Info,
  CheckCircle2, ScanSearch, RefreshCw, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PosterCritiqueData = {
  score: number;
  summary: string;
  issues: Array<{
    severity: "high" | "medium" | "low";
    area: string;
    title: string;
    fix: string;
  }>;
  strengths: string[];
};

type DraftPayload = {
  headline: string;
  petName: string;
  reward: string | null;
  urgent: boolean;
  description: string;
  areaLabel: string | null;
  hasImage: boolean;
  breed: string | null;
  colorText: string | null;
  sizeText: string | null;
  gender: string | null;
  ageText: string | null;
  collar: string | null;
  marks: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactEmail: string | null;
  hasQR: boolean;
  template: string;
};

export function PosterCritic({ postId, getDraft }: { postId: string; getDraft: () => DraftPayload }) {
  const [loading, setLoading] = useState(false);
  const [critique, setCritique] = useState<PosterCritiqueData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const draft = getDraft();
      const res = await fetch("/api/ai/poster-critic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No pudimos revisar el cartel");
      setCritique(data);
    } catch (e: any) {
      setError(e.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-50 to-sky-50 border-b">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-sky-500 text-white shadow">
          <ScanSearch className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm leading-tight">Revisor IA</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-700 ring-1 ring-violet-200">
              <Sparkles className="h-2.5 w-2.5" />
              Beta
            </span>
          </div>
          <span className="block text-[11px] text-muted-foreground leading-tight mt-0.5">
            Una IA revisa tu borrador y te sugiere ajustes antes de imprimir.
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {!critique && !loading && !error && (
          <div className="rounded-lg border border-dashed border-violet-200 bg-violet-50/40 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-3">
              Toca el botón y te damos un diagnóstico en ~10 seg.
            </p>
            <Button
              type="button"
              onClick={run}
              className="w-full gap-2 bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-700 hover:to-sky-700 text-white shadow"
            >
              <Sparkles className="h-4 w-4" />
              Revisar mi cartel
            </Button>
          </div>
        )}

        {loading && (
          <div className="rounded-lg border bg-muted/40 p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-violet-600 shrink-0" />
            <div className="text-sm">
              <div className="font-semibold">Analizando tu cartel…</div>
              <div className="text-xs text-muted-foreground">Revisando foto, texto, contacto y legibilidad.</div>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {critique && (
          <div className="space-y-3">
            <ScoreCard score={critique.score} summary={critique.summary} />

            {critique.issues.length > 0 && (
              <ul className="space-y-2">
                {critique.issues.map((issue, i) => (
                  <IssueRow key={i} issue={issue} />
                ))}
              </ul>
            )}

            {critique.strengths.length > 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1.5">
                  <CheckCircle2 className="h-3 w-3" />
                  Lo que ya está bien
                </div>
                <ul className="space-y-1">
                  {critique.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-emerald-900 flex items-start gap-1.5">
                      <Star className="h-3 w-3 mt-0.5 shrink-0 fill-emerald-500 text-emerald-500" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={run}
              disabled={loading}
              className="w-full gap-1.5"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              Revisar de nuevo
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function ScoreCard({ score, summary }: { score: number; summary: string }) {
  const tone =
    score >= 85 ? "emerald" : score >= 65 ? "amber" : "rose";
  const toneStyles = {
    emerald: { bg: "from-emerald-500 to-teal-500", ring: "ring-emerald-200", text: "text-emerald-900", label: "Excelente" },
    amber: { bg: "from-amber-500 to-orange-500", ring: "ring-amber-200", text: "text-amber-900", label: "Mejorable" },
    rose: { bg: "from-rose-500 to-red-500", ring: "ring-rose-200", text: "text-rose-900", label: "Necesita ajustes" },
  } as const;
  const s = toneStyles[tone];
  return (
    <div className={cn("rounded-xl border ring-1 p-3 flex items-center gap-3", s.ring)}>
      <div
        className={cn(
          "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white font-display font-bold text-xl shadow-lg",
          s.bg,
        )}
        aria-label={`Score ${score} de 100`}
      >
        {score}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white px-1.5 py-0 text-[8px] font-bold uppercase tracking-wider text-foreground ring-1 ring-border">
          /100
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className={cn("text-[10px] font-bold uppercase tracking-wider", s.text)}>{s.label}</div>
        <p className="text-xs text-foreground leading-relaxed mt-0.5">{summary}</p>
      </div>
    </div>
  );
}

function IssueRow({ issue }: { issue: PosterCritiqueData["issues"][number] }) {
  const severityStyles = {
    high: {
      ring: "ring-rose-200",
      bg: "bg-rose-50/60",
      icon: <AlertCircle className="h-4 w-4 text-rose-600" />,
      label: "Alto",
      labelBg: "bg-rose-600 text-white",
    },
    medium: {
      ring: "ring-amber-200",
      bg: "bg-amber-50/60",
      icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
      label: "Medio",
      labelBg: "bg-amber-500 text-white",
    },
    low: {
      ring: "ring-sky-200",
      bg: "bg-sky-50/60",
      icon: <Info className="h-4 w-4 text-sky-600" />,
      label: "Menor",
      labelBg: "bg-sky-500 text-white",
    },
  } as const;
  const s = severityStyles[issue.severity];
  return (
    <li className={cn("rounded-lg border ring-1 p-3", s.ring, s.bg)}>
      <div className="flex items-start gap-2">
        <span className="shrink-0 mt-0.5">{s.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider", s.labelBg)}>
              {s.label}
            </span>
            <span className="text-sm font-semibold leading-tight">{issue.title}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            👉 {issue.fix}
          </p>
        </div>
      </div>
    </li>
  );
}
