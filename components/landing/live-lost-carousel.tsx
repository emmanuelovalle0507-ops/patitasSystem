"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { optimizedUrl } from "@/lib/storage";
import { relativeTime } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MapPin, Flame } from "lucide-react";

export type LivePost = {
  id: string;
  title: string;
  areaLabel: string | null;
  createdAt: Date;
  imageUrl: string | null;
  petKind: string | null;
};

const PET_EMOJI: Record<string, string> = {
  DOG: "🐕",
  CAT: "🐈",
  BIRD: "🐦",
  REPTILE: "🦎",
  RODENT: "🐹",
  OTHER: "🐾",
};

export function LiveLostCarousel({ posts }: { posts: LivePost[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  if (posts.length === 0) return null;

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => scrollBy(-320)}
        className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white/95 backdrop-blur shadow-lg ring-1 ring-black/5 text-foreground hover:bg-white transition opacity-0 group-hover:opacity-100"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(320)}
        className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white/95 backdrop-blur shadow-lg ring-1 ring-black/5 text-foreground hover:bg-white transition opacity-0 group-hover:opacity-100"
        aria-label="Siguiente"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-4 -mx-4 px-4 md:-mx-0 md:px-0"
      >
        {posts.map((p) => {
          const hoursOld = (Date.now() - new Date(p.createdAt).getTime()) / 36e5;
          const isUrgent = hoursOld < 24;
          return (
            <Link
              key={p.id}
              href={`/posts/${p.id}`}
              className="group/card relative w-[240px] shrink-0 snap-start overflow-hidden rounded-2xl bg-card border shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                {p.imageUrl ? (
                  <Image
                    src={optimizedUrl(p.imageUrl, 480)}
                    alt={p.title}
                    fill
                    sizes="240px"
                    className="object-cover group-hover/card:scale-110 transition duration-500"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl opacity-60">
                    {p.petKind ? PET_EMOJI[p.petKind] ?? "🐾" : "🐾"}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                  {isUrgent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow animate-pulse">
                      <Flame className="h-3 w-3" />
                      Urgente
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-800">
                    Perdido
                  </span>
                </div>
                {p.petKind && (
                  <div className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-base shadow-md ring-1 ring-black/5">
                    {PET_EMOJI[p.petKind] ?? "🐾"}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <h3 className="font-semibold leading-tight line-clamp-1">{p.title}</h3>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-white/90">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{p.areaLabel ?? "Tecámac"}</span>
                    <span className="opacity-70 mx-0.5">·</span>
                    <span className="opacity-90">{relativeTime(p.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        <Link
          href="/feed?t=lost"
          className="flex w-[240px] shrink-0 snap-start items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/50 text-brand-700 p-6 hover:bg-brand-50 hover:border-brand-400 transition min-h-full"
        >
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white">
              <ChevronRight className="h-6 w-6" />
            </div>
            <div className="font-semibold">Ver todos</div>
            <div className="text-xs text-brand-600/80 mt-1">Explora la comunidad</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
