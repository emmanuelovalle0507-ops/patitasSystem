"use client";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Dame un dato curioso del día",
  "Consejos si perdí a mi mascota",
  "Cómo mejorar mi cartel",
  "¿Qué vacunas necesita mi mascota?",
];

export function AssistantQuickCard({ favoritePets, userName }: { favoritePets: string[]; userName: string }) {
  return (
    <Card className="bg-gradient-to-br from-brand-50 to-background border-brand-200">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-display text-lg font-bold">Patitas AI</h3>
              <p className="text-sm text-muted-foreground">
                Tu asistente personal. {favoritePets.length > 0 ? `Conoce que te gustan ${favoritePets.length} tipo(s) de mascotas.` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <Button key={s} asChild variant="outline" size="sm" className="bg-background">
                  <Link href={`/assistant?q=${encodeURIComponent(s)}`}>{s}</Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
