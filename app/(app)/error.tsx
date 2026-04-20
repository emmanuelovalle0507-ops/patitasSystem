"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center space-y-4 px-4">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h2 className="font-display text-2xl font-bold">Algo salió mal</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        No pudimos cargar esta sección. Intenta de nuevo o vuelve al inicio.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">ref: {error.digest}</p>
      )}
      <div className="flex gap-2">
        <Button onClick={reset}>Reintentar</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>Ir al inicio</Button>
      </div>
    </div>
  );
}
