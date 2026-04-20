"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Search, Dog, Cat, Bird, Squirrel, PawPrint, Clock, Flame, Heart, MessageCircle, X, SlidersHorizontal,
} from "lucide-react";

type Species = "DOG" | "CAT" | "BIRD" | "OTHER";

const SPECIES: { key: Species; label: string; icon: any; color: string }[] = [
  { key: "DOG", label: "Perros", icon: Dog, color: "data-[active=true]:bg-brand-500 data-[active=true]:text-white data-[active=true]:border-brand-500" },
  { key: "CAT", label: "Gatos", icon: Cat, color: "data-[active=true]:bg-violet-500 data-[active=true]:text-white data-[active=true]:border-violet-500" },
  { key: "BIRD", label: "Aves", icon: Bird, color: "data-[active=true]:bg-sky-500 data-[active=true]:text-white data-[active=true]:border-sky-500" },
  { key: "OTHER", label: "Otros", icon: Squirrel, color: "data-[active=true]:bg-amber-500 data-[active=true]:text-white data-[active=true]:border-amber-500" },
];

const SORTS: { key: string; label: string; icon: any }[] = [
  { key: "recent", label: "Recientes", icon: Clock },
  { key: "urgent", label: "Urgentes", icon: Flame },
  { key: "popular", label: "Populares", icon: Heart },
  { key: "commented", label: "Con más pistas", icon: MessageCircle },
];

const STATUSES: { key: string; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Activos" },
  { key: "found", label: "Encontrados" },
];

export function FeedFilterBar({ tab }: { tab: "lost" | "community" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = params.get("q") ?? "";
  const k = params.get("k") ?? ""; // species
  const sort = params.get("sort") ?? "recent";
  const status = params.get("status") ?? "all";

  const hasAnyFilter = q || k || sort !== "recent" || status !== "all";

  const update = useCallback(
    (next: Record<string, string | null>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(next)) {
        if (!value) sp.delete(key);
        else sp.set(key, value);
      }
      startTransition(() => {
        router.replace(`/feed?${sp.toString()}`);
      });
    },
    [params, router]
  );

  function clearAll() {
    startTransition(() => {
      const sp = new URLSearchParams();
      sp.set("t", tab);
      router.replace(`/feed?${sp.toString()}`);
    });
  }

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm p-3 sm:p-4 space-y-3",
        pending && "opacity-80"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            defaultValue={q}
            placeholder="Buscar por nombre, raza, zona..."
            className="pl-9 pr-9 h-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") update({ q: (e.target as HTMLInputElement).value || null });
            }}
            onBlur={(e) => {
              if (e.target.value !== q) update({ q: e.target.value || null });
            }}
          />
          {q && (
            <button
              type="button"
              onClick={() => update({ q: null })}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {hasAnyFilter && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5 text-muted-foreground hover:text-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none">
        <PawPrint className="h-4 w-4 shrink-0 text-muted-foreground" />
        {SPECIES.map((sp) => {
          const active = k === sp.key;
          const Icon = sp.icon;
          return (
            <button
              key={sp.key}
              type="button"
              data-active={active}
              onClick={() => update({ k: active ? null : sp.key })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition shrink-0",
                "hover:border-foreground/30",
                sp.color
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {sp.label}
            </button>
          );
        })}

        <span className="mx-1 h-5 w-px bg-border shrink-0" />

        {STATUSES.map((st) => {
          const active = status === st.key;
          return (
            <button
              key={st.key}
              type="button"
              onClick={() => update({ status: st.key === "all" ? null : st.key })}
              className={cn(
                "rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition shrink-0 hover:border-foreground/30",
                active && "bg-foreground text-background border-foreground"
              )}
            >
              {st.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0">Ordenar</span>
        {SORTS.map((s) => {
          const active = sort === s.key;
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => update({ sort: s.key === "recent" ? null : s.key })}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition shrink-0",
                active
                  ? "bg-brand-100 text-brand-700 font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-3 w-3" />
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
