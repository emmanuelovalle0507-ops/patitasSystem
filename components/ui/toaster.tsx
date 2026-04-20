"use client";
import * as React from "react";

/**
 * Toaster mínimo basado en eventos del DOM (sin dependencia externa extra).
 * Uso: import { toast } from "@/components/ui/toaster"; toast("Hola");
 */
type Toast = { id: number; message: string; type?: "success" | "error" | "info" };

const listeners = new Set<(t: Toast) => void>();
let counter = 0;

export function toast(message: string, type: Toast["type"] = "info") {
  const t: Toast = { id: ++counter, message, type };
  listeners.forEach((l) => l(t));
}

export function Toaster() {
  const [items, setItems] = React.useState<Toast[]>([]);
  React.useEffect(() => {
    const push = (t: Toast) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => setItems((prev) => prev.filter((p) => p.id !== t.id)), 4000);
    };
    listeners.add(push);
    return () => { listeners.delete(push); };
  }, []);
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2 safe-bottom">
      {items.map((t) => (
        <div
          key={t.id}
          className={
            "pointer-events-auto rounded-lg px-4 py-3 shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2 " +
            (t.type === "success" ? "bg-emerald-600 text-white" :
             t.type === "error" ? "bg-destructive text-destructive-foreground" :
             "bg-foreground text-background")
          }
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
