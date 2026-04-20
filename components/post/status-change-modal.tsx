"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updatePostStatus } from "@/app/actions/posts";
import { toast } from "@/components/ui/toaster";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

type Props = {
  postId: string;
  currentStatus: string;
  trigger?: React.ReactNode;
};

const STATUS_OPTIONS = [
  {
    value: "FOUND" as const,
    label: "Marcar como encontrado",
    description: "Tu mascota ha sido encontrada y está de vuelta en casa.",
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200 hover:bg-green-100",
  },
  {
    value: "IN_PROGRESS" as const,
    label: "En proceso de búsqueda",
    description: "Hay pistas o avistamientos. La búsqueda sigue activa.",
    icon: <Clock className="h-5 w-5" />,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  },
  {
    value: "LOST" as const,
    label: "Sigue perdido",
    description: "Restablecer el estado a perdido para reactivar la búsqueda.",
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200 hover:bg-red-100",
  },
];

export function StatusChangeModal({ postId, currentStatus, trigger }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  function confirm() {
    if (!selected) return;
    start(async () => {
      try {
        await updatePostStatus(postId, selected as any);
        toast("Estado actualizado", "success");
        setOpen(false);
      } catch (e: any) {
        toast(e?.message || "Error", "error");
      }
    });
  }

  const available = STATUS_OPTIONS.filter((s) => s.value !== currentStatus);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setSelected(null); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="gap-2">
            <Clock className="h-4 w-4" />
            Cambiar estado
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar estado del reporte</DialogTitle>
          <DialogDescription>
            Selecciona el nuevo estado para este reporte de mascota perdida.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {available.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                selected === opt.value
                  ? `${opt.bgColor} ring-2 ring-offset-1 ring-primary/30`
                  : "border-transparent bg-muted/30 hover:bg-muted/60"
              }`}
            >
              <div className={`mt-0.5 shrink-0 ${opt.color}`}>{opt.icon}</div>
              <div>
                <p className="font-semibold text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={confirm} disabled={!selected || pending}>
            {pending ? "Guardando..." : "Confirmar cambio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
