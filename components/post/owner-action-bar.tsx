"use client";

import Link from "next/link";
import type { PostStatus } from "@prisma/client";
import { Share2, ClipboardEdit, Printer, CheckCircle2 } from "lucide-react";
import { ShareModal } from "@/components/post/share-modal";
import { StatusChangeModal } from "@/components/post/status-change-modal";

type Props = {
  postId: string;
  status: PostStatus;
  url: string;
  title: string;
  text: string;
};

export function OwnerActionBar({ postId, status, url, title, text }: Props) {
  const isFound = status === "FOUND";

  return (
    <section className="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 via-orange-50/60 to-amber-50 shadow-sm">
      <div className="flex items-center gap-3 border-b border-brand-100 bg-white/60 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow">
          <ClipboardEdit className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-brand-900 leading-tight">Gestiona tu reporte</p>
          <p className="text-[11px] text-brand-800/80 leading-tight mt-0.5">
            {isFound
              ? "Tu mascota está de vuelta ❤️ ¿Quieres reabrir la búsqueda o agradecer a la comunidad?"
              : "Comparte para llegar a más vecinos y actualiza el estado cuando haya novedades."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 p-2.5 sm:grid-cols-3 sm:p-3">
        <ShareModal
          url={url}
          title={title}
          text={text}
          trigger={
            <button
              type="button"
              className="group flex min-h-[56px] items-center gap-3 rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-brand-400 hover:shadow active:scale-[0.99]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white sm:h-9 sm:w-9">
                <Share2 className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-tight">Compartir</span>
                <span className="block text-[11px] text-muted-foreground leading-tight mt-0.5">
                  WhatsApp, redes o enlace
                </span>
              </span>
            </button>
          }
        />

        <StatusChangeModal
          postId={postId}
          currentStatus={status}
          trigger={
            <button
              type="button"
              className="group flex min-h-[56px] items-center gap-3 rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-emerald-400 hover:shadow active:scale-[0.99]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white sm:h-9 sm:w-9">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-tight">Cambiar estado</span>
                <span className="block text-[11px] text-muted-foreground leading-tight mt-0.5">
                  {isFound ? "Reabrir búsqueda" : "Marcar como encontrado"}
                </span>
              </span>
            </button>
          }
        />

        <Link
          href={`/posters/${postId}`}
          className="group flex min-h-[56px] items-center gap-3 rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-amber-400 hover:shadow active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white sm:h-9 sm:w-9">
            <Printer className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold leading-tight">Generar cartel</span>
            <span className="block text-[11px] text-muted-foreground leading-tight mt-0.5">
              PDF listo para imprimir
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}
