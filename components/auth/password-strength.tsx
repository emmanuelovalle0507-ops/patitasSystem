"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Rule = { id: string; label: string; test: (p: string) => boolean };

const RULES: Rule[] = [
  { id: "len", label: "Al menos 8 caracteres", test: (p) => p.length >= 8 },
  { id: "case", label: "Mayúsculas y minúsculas", test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: "num", label: "Incluye un número", test: (p) => /\d/.test(p) },
  { id: "sym", label: "Un símbolo (!@#$…)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function scorePassword(password: string): number {
  return RULES.reduce((acc, r) => (r.test(password) ? acc + 1 : acc), 0);
}

const TIERS = [
  { min: 0, label: "Muy débil", color: "bg-rose-500", text: "text-rose-700" },
  { min: 1, label: "Débil", color: "bg-orange-500", text: "text-orange-700" },
  { min: 2, label: "Aceptable", color: "bg-amber-500", text: "text-amber-700" },
  { min: 3, label: "Buena", color: "bg-lime-500", text: "text-lime-700" },
  { min: 4, label: "Excelente", color: "bg-emerald-500", text: "text-emerald-700" },
];

export function PasswordStrength({ password }: { password: string }) {
  const score = scorePassword(password);
  const tier = TIERS[score];
  const showRules = password.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition",
              i < score ? tier.color : "bg-muted"
            )}
          />
        ))}
      </div>
      {showRules && (
        <>
          <div className={cn("text-[11px] font-medium", tier.text)}>
            Seguridad: {tier.label}
          </div>
          <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            {RULES.map((r) => {
              const ok = r.test(password);
              return (
                <li
                  key={r.id}
                  className={cn(
                    "flex items-center gap-1 text-[11px] transition",
                    ok ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"
                  )}
                >
                  {ok ? (
                    <Check className="h-3 w-3 shrink-0" />
                  ) : (
                    <X className="h-3 w-3 shrink-0 opacity-60" />
                  )}
                  {r.label}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
